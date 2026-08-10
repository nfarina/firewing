// Allows transforming colors in the HSL color space. Not currently used; OKLCH
// is superior.

/** P3 components in [0-1]. */
export type P3 = { mode: "p3"; r: number; g: number; b: number };

/** HSL components (hue in degrees [0-360], saturation and lightness in [0,1]). */
export type HSL = { type: "hsl"; h: number; s: number; l: number };

export function parseHsl(hex: string): HSL {
  return p3ToHsl(hexToP3(hex));
}

export function formatHsl(hsl: HSL): string {
  // Convert back to RGB HEX string.
  return p3ToHex(hslToP3(hsl));
}

/**
 * Parses a hex string like "#abcdef" only, not like "#aaa", into its raw
 * component values (0-255).
 */
export function parseHex(hex: string): [red: number, green: number, blue: number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid color ${hex}`);
  const [_, ...components] = result;
  const [r, g, b] = components.map((c) => parseInt(c, 16));
  return [r, g, b];
}

//
// Low level conversion functions.
//

function p3ToHsl({ r, g, b }: P3): HSL {
  const v = Math.max(r, g, b),
    c = v - Math.min(r, g, b),
    f = 1 - Math.abs(v + v - c - 1);

  const h = c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);

  return {
    type: "hsl",
    h: 60 * (h < 0 ? h + 6 : h),
    s: f ? c / f : 0,
    l: (v + v - c) / 2,
  };
}

function hslToP3({ h, s, l }: HSL): P3 {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k: number = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

  return { mode: "p3", r: f(0), g: f(8), b: f(4) };
}

/** Assumes the hex code is valid. */
function hexToP3(hex: string): P3 {
  const [r, g, b] = parseHex(hex);
  return { mode: "p3", r: r / 255, g: g / 255, b: b / 255 };
}

/** Always results in a 7-character string like #abcdef, assuming the p3 components are in range. */
function p3ToHex(p3: P3): string {
  const { r, g, b } = p3;
  const [red, green, blue] = [r, g, b].map((c) =>
    Math.max(0, Math.min(255, Math.round(c * 255)))
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${red}${green}${blue}`;
}
