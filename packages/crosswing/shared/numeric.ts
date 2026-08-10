//
// Generic number formatting and parsing that deals with integers only and
// avoids floating-point math.
//

export type ParseNumberOptions = {
  /**
   * We only work with integers to avoid floating-point errors.
   * You can use `precision` to work with integers that represent fractional
   * amounts, without using floating point math. For instance, when working with
   * currency, you'd typically store the value in pennies, but display it as
   * dollars. In this case, you'd set `precision` to 2, since the number 100 is
   * equivalent to $1.00 (2 decimal places).
   */
  precision?: number;
  /**
   * Optional prefix to add before the number, like "$" (the negative sign will
   * appear before this, for negative numbers).
   */
  prefix?: string;
  /** Optional suffix to add after the number, like "%". */
  suffix?: string;
};

export type FormatNumberOptions = ParseNumberOptions & {
  /** Whether to insert commas separating thousands, etc. Default is true. */
  commas?: boolean;
  /** How many decimal places to include. Default is determined by precision. */
  decimals?: number;
  /**
   * By default ("none"), if precision is specified, we will add or pad the
   * fractional component with zeros.
   *
   * By passing, "all", ONLY if the fractional part of the formatted amount is
   * entirely zeroes, we'll remove it and the period itself. This is suitable
   * for currency: "$13.00" -> "$13", "$13.5" -> "$13.50".
   *
   * By passing "any", we will remove any zeroes at the end of the fractional
   * amount, up to and including the period itself. This is suitable for most
   * numbers, like percentages: "13.00%" -> "13%", "13.50%" -> "13.5%".
   *
   * For convenience with React components that want to pass on a value for
   * this parameter, you can also pass a boolean, where true is equivalent to
   * "all" and false is equivalent to "none".
   */
  dropZeros?: "all" | "any" | "none" | boolean;
  /** Adds a leading zero to fractional numbers like "0.25". Default true. */
  leadingZero?: boolean;
};

/**
 * Parses a "pretty" numeric string, like "1,000" -> 1000. Returns an integer
 * or NaN (does not work with floating point numbers - use `precision` instead
 * to represent fractional numbers as integers).
 */
export function parseNumber(
  str: string,
  { prefix = "", suffix = "", precision = 0 }: FormatNumberOptions = {},
): number {
  // Clean the string.
  str = str
    .trim()
    .replace(",", "") // Remove commas
    .replace(prefix, "") // Remove prefix
    .replace(suffix, "") // Remove suffix
    .replace("–", "-") // Replace en-dash
    .replace("—", "-") // Replace em-dash
    .replace(/^\(([0-9]+\.?[0-9]+)\)$/, "-$1"); // convert "accounting style" negatives like (4.99) to -4.99

  // If, after cleaning, we still have input that isn't a valid number, return NaN.
  if (!str.match(/^-?[0-9]+\.?[0-9]*$/)) {
    return Number.NaN;
  }

  // We only work with whole numbers, to avoid floating-point errors. First
  // we'll move the dot to the right by the precision.
  const [whole, decimal = ""] = str.split(".");

  // We want the entire whole number portion plus `precision` characters of
  // the fractional portion, if present.
  // For an example of precision 2, we want "105" -> "10500"
  // and "105.25982" -> "10525"

  // Pad the fractional part with zeroes to the right.
  const fractional = decimal.padEnd(precision, "0");

  // Take the whole number and `precision` characters of the fractional part.
  str = whole + fractional.slice(0, precision);

  // Parse the number as an integer.
  return parseInt(str);
}

/**
 * Formats a number to a nice string, like 1000 -> 1,000, or 45.00 -> 45.
 * Assumes the number is an integer; we don't work with floats to avoid errors.
 * You can use `precision` to work with integers that represent fractional
 * amounts, without using floating point math. For instance,
 *
 *   formatNumber(6_25, { precision: 2 }) // "6.25"
 */
export function formatNumber(
  num: number,
  {
    precision = 0,
    decimals = precision,
    commas = true,
    dropZeros = "none",
    prefix = "",
    suffix = "",
    leadingZero = true,
  }: FormatNumberOptions = {},
): string {
  if (Number.isNaN(num)) {
    return num.toString(); // NaN
  }

  // Extract the sign.
  const sign = num < 0 ? "-" : "";
  num = Math.abs(num);

  // If you specified a number of decimal places less than our precision, we'll
  // round the number to that many decimal places.
  if (decimals < precision) {
    const round = precision - decimals;
    // We must unavoidably do floating-point math here, but we'll round it
    // back to an integer for toFixed.
    num = Math.round(num / 10 ** round) * 10 ** round;
  }

  // Initial formatting.
  let str = num.toFixed(0);

  // Make sure we have enough zeroes on the left to work with.
  str = str.padStart(precision, "0");

  // Split off the last `precision` characters.
  let whole = precision > 0 ? str.slice(0, -precision) : str;
  let frac = precision > 0 ? str.slice(-precision) : "";

  // Remove leading zeroes now that we've split it.
  whole = whole.replace(/^0+/, "");

  // Insert commas if requested.
  if (commas) {
    // Thanks to http://stackoverflow.com/a/721415/66673
    whole = whole.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  }

  // Add leading zero if requested.
  if (leadingZero && !whole) {
    whole = "0";
  }

  // If decimals is less than precision, we'll drop the extra digits from the
  // fractional part.
  if (decimals < precision) {
    frac = frac.slice(0, decimals);
  }

  const drop = typeof dropZeros === "boolean" ? (dropZeros ? "all" : "none") : dropZeros;

  // If you don't want to see all zeroes in the fractional component, remove
  // them.
  if (drop === "all" && frac === "0".repeat(decimals)) {
    str = whole;
  } else if (drop === "any" && frac.match(/0+$/)) {
    frac = frac.replace(/0+$/, "");
    str = frac ? `${whole}.${frac}` : whole;
  } else {
    str = frac ? `${whole}.${frac}` : whole;
  }

  // Add any prefix and suffix.
  return `${sign}${prefix}${str}${suffix}`;
}

//
// Percentage formatting and parsing. Percentages are stored as "bps" which is
// an integer. For instance, 5% is stored as 500.
//

/**
 * Parses a percentage value into bps.
 */
export function parsePercentage(
  str: string,
  { suffix = "%", precision = 2, ...rest }: ParseNumberOptions = {},
): number {
  return parseNumber(str, { ...rest, precision, suffix });
}

/**
 * Formats a bps value as a percentage.
 */
export function formatPercentage(
  bps: number,
  { suffix = "%", precision = 2, dropZeros = "any", ...rest }: FormatNumberOptions = {},
): string {
  return formatNumber(bps, { ...rest, precision, suffix, dropZeros });
}

//
// Currency formatting and parsing. Currency is represented as pennies which is
// always an integer. For instance, $5.00 is stored as 500.
//

/**
 * Parses a currency value into pennies.
 */
export function parseCurrency(
  str: string,
  { prefix = "$", precision = 2, ...rest }: ParseNumberOptions = {},
): number {
  return parseNumber(str, { ...rest, precision, prefix });
}

/**
 * Formats a currency value as a string.
 */
export function formatCurrency(
  cents: number,
  { prefix = "$", precision = 2, ...rest }: FormatNumberOptions = {},
): string {
  return formatNumber(cents, { ...rest, precision, prefix });
}
