// A type to extract the parameter names from a path.
type ExtractParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

// Maps extracted parameter names to string types.
export type MatchParams<Path extends string> = Record<ExtractParams<Path>, string>;

export class RouterLocation<Path extends string = any> {
  public static fromHref(href: string): RouterLocation {
    const [pathname, search = ""] = href.split("?");
    return new RouterLocation({
      segments: segmentize(pathname),
      search: search ? "?" + search : "",
    });
  }

  public static fromLocation(browserLocation: Location, basePath: string = ""): RouterLocation {
    const { pathname, search } = browserLocation;
    return new RouterLocation({
      segments: segmentize(pathname.substr(basePath.length)),
      search,
    });
  }

  public search: string = "";
  public params: MatchParams<Path> = {} as any;
  public segments: string[] = [];
  public claimIndex: number = 0;

  /**
   * Transient marker indicating this location was reached via a `replace`
   * navigation (`history.navigate(to, { replace: true })`, e.g. <Redirect>),
   * rather than a push. It rides from the history event down through the claim
   * chain to <Navs> so the stack can swap its top entry instead of pushing a
   * new one — matching history.replaceState semantics. It is NOT part of the
   * location's identity (`equals()` and `href()` ignore it), but it is included
   * in `serialize()` so it survives the <Router>'s useDeferredValue round-trip.
   */
  public replace?: boolean;

  constructor(props: Partial<RouterLocation> = {}) {
    for (const prop of Object.keys(props)) {
      this[prop] = props[prop];
    }
  }

  public searchParams(): URLSearchParams {
    return new URLSearchParams(this.search);
  }

  public searchRecord(): Record<string, string | null> {
    const params = this.searchParams();
    const result: Record<string, string | null> = {};
    for (const [key, value] of params.entries()) {
      result[key] = value || "true"; // Coerce parameters that are present but have no value to be "true".
    }
    return result;
  }

  public serialize(): string {
    return JSON.stringify({
      search: this.search,
      params: this.params,
      segments: this.segments,
      claimIndex: this.claimIndex,
      // Only emitted when set; JSON.stringify drops undefined keys, keeping the
      // serialized string (and thus useDeferredValue identity) stable otherwise.
      replace: this.replace,
    });
  }

  public static deserialize(serialized: string): RouterLocation {
    const { search, params, segments, claimIndex, replace } = JSON.parse(serialized);
    return new RouterLocation({ search, params, segments, claimIndex, replace });
  }

  /**
   * Utility method for getting a cloned copy of RouterLocation that adds or
   * changes one or more parameters on the querystring. You can pass null
   * for a param value to delete it from the querystring entirely (if it was
   * there before).
   */
  public withParams(params: Record<string, string | null>) {
    const searchParams = this.searchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value !== null) {
        searchParams.set(name, value);
      } else {
        searchParams.delete(name);
      }
    }
    const newSearch = searchParams.toString();
    return this.clone({ search: newSearch ? `?${newSearch}` : "" });
  }

  /**
   * Utility method for getting a cloned copy of RouterLocation that adds or
   * changes a parameter on the querystring. You can pass null
   * for the param value to delete it from the querystring entirely.
   */
  public withParam(name: string, value: string | null) {
    return this.withParams({ [name]: value });
  }

  public clone(props: Partial<RouterLocation> = {}): RouterLocation {
    // We can pass `this` safely - constructor uses Object.keys which is fine
    // because we don't bind any of our methods.
    const location = new RouterLocation(this);
    for (const prop of Object.keys(props)) {
      location[prop] = props[prop];
    }
    return location;
  }

  /**
   * Gets the entire path and search query if any (unless excluded), including
   * claimed and unclaimed segments.
   */
  public href({ excludeSearch = false }: { excludeSearch?: boolean } = {}): string {
    return "/" + this.segments.join("/") + (excludeSearch ? "" : this.search);
  }

  /**
   * Returns true if the given possibly-relative path matches the current
   * location. If you pass {prefixOnly: true}, it will return true if the
   * current location starts with the given path.
   */
  public isLinkActive(path: string, { prefixOnly }: { prefixOnly?: boolean } = {}): boolean {
    const fullPath = this.linkTo(path);
    if (prefixOnly) {
      return this.href().startsWith(fullPath);
    } else {
      return this.href() === fullPath;
    }
  }

  public claimedSegments(): string[] {
    return this.segments.slice(0, this.claimIndex);
  }

  /**
   * Returns just the portion of the path that has been claimed, without a
   * leading slash and without any search query.
   *
   * So for "[app/home]/blah?test=true", returns "app/home".
   */
  public claimedPath(): string {
    const segments = this.claimedSegments();
    return segments.length > 0 ? segments.join("/") : "";
  }

  /**
   * Returns any unclaimed path segments.
   * So for "[app/home]/blah?test=true", returns ["blah"].
   */
  public unclaimedSegments(): string[] {
    return this.segments.slice(this.claimIndex);
  }

  /**
   * Returns just the portion of the path that hasn't been claimed.
   * So for "[app/home]/blah?test=true", returns "blah".
   */
  public unclaimedPath(): string {
    const segments = this.unclaimedSegments();
    return segments.length > 0 ? segments.join("/") : "";
  }

  /**
   * Returns just the portion of the href that has been claimed, with a leading
   * slash and without any search query.
   *
   * So for "[app/home]/blah?test=true", returns "/app/home".
   */
  public claimedHref(): string {
    return "/" + this.claimedPath();
  }

  /**
   * Returns just the portion of the href that hasn't been claimed.
   * So for "[app/home]/blah?test=true", returns "blah?test=true".
   */
  public unclaimedHref(): string {
    return this.unclaimedPath() + this.search;
  }

  public claim(path: string): RouterLocation {
    const claimed = this.tryClaim(path);

    if (!claimed) {
      throw new Error(`Could not claim path "${path}" from location "${this}"`);
    }

    return claimed;
  }

  public tryClaim(path: string): RouterLocation | void {
    const { segments, claimIndex } = this;

    // Split your claim into segments that we can step through.
    const claimSegments = segmentize(path);

    if (claimSegments.length === 0 && claimIndex < segments.length) {
      // You are trying to claim an empty path but there are segments
      // remaining.
      return;
    }

    // Go through your claim segments one by one, verify that they match the
    // segments we have left, and extract any params.
    const params = {};
    for (let i = 0; i < claimSegments.length; i++) {
      const claimSegment = claimSegments[i];
      const matchSegment = segments[claimIndex + i];

      if (!matchSegment) return; // Can't claim more than we have!

      if (claimSegment.startsWith(":")) {
        const name = claimSegment.substring(1);
        params[name] = matchSegment;
      } else {
        // Verify that your claim matches the actual path segment.
        if (claimSegment !== matchSegment) return;
      }
    }

    return this.clone({
      claimIndex: claimIndex + claimSegments.length,
      params,
    });
  }

  /** Returns a new RouterLocation with all path segments claimed. */
  public claimAll(): RouterLocation {
    return this.clone({ claimIndex: this.segments.length });
  }

  /**
   * Returns a new RouterLocation which is the combination of our claimed
   * segments, plus any new segments in the given path.
   */
  public rewrite(
    path: string,
    { preserveClaimIndex = false }: { preserveClaimIndex?: boolean } = {},
  ): RouterLocation {
    const newSegments = segmentize(path);
    const allSegments = [...this.segments.slice(0, this.claimIndex), ...newSegments];
    return this.clone({
      segments: allSegments,
      claimIndex: preserveClaimIndex ? this.claimIndex : this.claimIndex + newSegments.length,
      search: "",
    });
  }

  /** Returns an absolute path, given a possibly-relative path. */
  public linkTo(path: string): string {
    // Path already absolute? We're done.
    if (path && path.startsWith("/")) return path;

    const newSegments = this.segments.slice(0, this.claimIndex);

    if (path.startsWith("?")) {
      // You're just adding a querystring.
      if (path === "?") path = ""; // Navigating to "?" clears the querystring.
      return "/" + newSegments.join("/") + path;
    }

    for (const segment of segmentize(path)) {
      // Allow going up a directory using ".."
      if (segment === "..") {
        newSegments.pop();
        // Ignore current directory "." (why would you even…)
      } else if (segment !== ".") {
        newSegments.push(segment);
      }
    }

    // Return an absolute path.
    return "/" + newSegments.join("/");
  }

  public toString() {
    const { segments, claimIndex, search } = this;

    const claimed = segments.slice(0, claimIndex);
    const remaining = segments.slice(claimIndex);

    let str = "";
    if (claimed.length > 0) str += "[" + claimed.join("/") + "]";
    if (claimed.length > 0 && remaining.length > 0) str += "/";
    if (remaining.length > 0) str += remaining.join("/");
    if (search) str += this.search;
    return str || "/";
  }

  public equals(
    other: RouterLocation,
    { excludeSearch = false }: { excludeSearch?: boolean } = {},
  ): boolean {
    return this.href({ excludeSearch }) === other.href({ excludeSearch });
  }
}

function segmentize(uri: string): string[] {
  // Strip querystring, if any.
  let stripped = uri.replace(/\?.*/, "");
  // Strip starting/ending slashes.
  stripped = uri.replace(/(^\/+|\/+$)/g, "");
  if (stripped) return stripped.split("/");
  return [];
}
