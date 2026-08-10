// Cached.
let linkElement: HTMLAnchorElement | null = null;

/**
 * External link opening utility. Won't always work on mobile; use openUrl
 * from <HostProvider> instead.
 */
export function openExternalLink(href: string, target: string = "_blank") {
  console.log("Opening external href", href);

  // This won't work due to security restrictions.
  // window.open(href, '_blank');

  // https://stackoverflow.com/a/31199285/66673
  if (!linkElement) {
    linkElement = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "a",
    ) as HTMLAnchorElement;
  }

  linkElement.href = href;
  if (target) linkElement.target = target;
  linkElement.click();
}
