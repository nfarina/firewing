// Greatly inspired by https://github.com/Teun/thenBy.js

type CompareFunction<T> = (a: T, b: T) => number;
type KeySelector<T> = keyof T | ((item: T) => any);
type Direction = "asc" | "desc" | 1 | -1;
type Options =
  | Direction
  | {
      ignoreCase?: boolean;
      direction?: Direction;
      cmp?: CompareFunction<any>;
    };

type SortSpec<T> = CompareFunction<T> | KeySelector<T>;

export function sort<T>(items: T[]): ChainedSort<T>;
export function sort<T>(items: T[], comparator: CompareFunction<T>, options?: Options): T[];
export function sort<T>(items: T[], keySelector: KeySelector<T>, options?: Options): T[];
/**
 * Sorts the given items and returns a new sorted array, or returns a chained
 * sort object for multiple sort specs.
 */
export function sort<T>(
  items: T[],
  spec?: SortSpec<T>,
  options: Options = {},
): T[] | ChainedSort<T> {
  if (spec) {
    return new ChainedSort(items).finally(spec as any, options);
  } else {
    return new ChainedSort(items);
  }
}

// Utility Functions
function identity<T>(v: T): T {
  return v;
}

function ignoreCase(v: string): string {
  return v.toLowerCase();
}

function isSelector<T>(func: SortSpec<T>): func is KeySelector<T> {
  return typeof func === "function" && func.length === 1;
}

function makeCompareFunction<T>(spec: SortSpec<T>, options: Options = {}): CompareFunction<T> {
  options = typeof options === "object" ? options : { direction: options };

  if (typeof spec != "function") {
    const prop = spec;
    // make unary function
    spec = (obj: T) => (obj[prop] ? obj[prop] : "");
  }

  if (isSelector(spec)) {
    // f is a unary function mapping a single item to its sort score
    const selector = spec;
    const preprocess = options.ignoreCase ? ignoreCase : identity;
    const cmp = options.cmp || ((v1, v2) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0));

    spec = (v1, v2) => cmp(preprocess(selector(v1)), preprocess(selector(v2)));
  }

  const descTokens = { "-1": "", desc: "" };

  if (options.direction && options.direction in descTokens) {
    // Need a const so TypeScript believes it's immutable.
    const compareFunc = spec;
    return (v1, v2) => -compareFunc(v1, v2);
  }

  return spec;
}

export class ChainedSort<T> {
  private comparators: CompareFunction<T>[] = [];

  constructor(private items: T[]) {}

  /** Adds a sort specification to the list of sorts. */
  by(comparator: CompareFunction<T>, options?: Options): ChainedSort<T>;
  by(selector: KeySelector<T>, options?: Options): ChainedSort<T>;
  by(spec: SortSpec<T>, options?: Options): ChainedSort<T> {
    const comparator = makeCompareFunction(spec, options);
    this.comparators.push(comparator);
    return this;
  }

  /** Adds a sort specification to the list of sorts. Identical to `this.by` */
  then(comparator: CompareFunction<T>, options?: Options): ChainedSort<T>;
  then(selector: KeySelector<T>, options?: Options): ChainedSort<T>;
  then(spec: SortSpec<T>, options?: Options): ChainedSort<T> {
    // .then is just syntactic sugar for .by
    return this.by(spec as any, options);
  }

  /**
   * Adds a final sort specification to the list of sorts and returns a new
   * sorted array.
   */
  finally(comparator: CompareFunction<T>, options?: Options): T[];
  finally(selector: KeySelector<T>, options?: Options): T[];
  finally(spec: SortSpec<T>, options?: Options): T[] {
    this.by(spec as any, options);

    return [...this.items].sort((a, b) => {
      for (const comparator of this.comparators) {
        const result = comparator(a, b);
        if (result !== 0) return result;
      }
      return 0;
    });
  }
}
