/* eslint-disable */
// Allows transforming colors in the OKLCH color space. See README.md for more
// information.

export type P3 = { mode: "p3"; r: number; g: number; b: number };
export type Oklch = { mode: "oklch"; l: number; c: number; h: number };

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

/** Parses a hex string like "#abcdef" into an Oklch object. */
export function parseOklch(hex: string): Oklch {
  const p3 = hexToP3(hex);
  return p3ToOklch(p3);
}

let p3Converter: any;
function getP3Converter(): any {
  if (!p3Converter) {
    // Prepare culori's converter to go from Oklch to P3 while adjusting to fit
    // within the P3 gamut.
    useMode(modeOklch);
    useMode(modeP3);
    p3Converter = toGamut("p3", "oklch");
  }

  return p3Converter;
}

/** Format an Oklch object into a P3-colorspace HEX string. */
export function formatOklch(oklch: Oklch): string {
  // You may have manipulated your Oklch object in ways that are outside the
  // P3 gamut. So we adjust the chroma until it's within the P3 gamut.

  // The converter seems to return {} if the lightness is out of range, so
  // we'll do that manually.
  if (oklch.l <= 0) return "#000000";
  if (oklch.l >= 1) return "#ffffff";

  const converter = getP3Converter();
  const p3 = converter(oklch);
  const hex = p3ToHex(p3);

  // Also do a blind conversion to see if we ended up being out of range.
  // Disabled because it doesn't really help the developer fix the problem.
  // const p3Blind = oklchToP3(oklch);
  // const hexBlind = p3ToHex(p3Blind);
  // if (hex !== hexBlind) {
  //   console.warn(
  //     `Color conversion resulted in an out of range value. Clipped value ${hex} was returned.`,
  //   );
  // }

  return hex;
}

//
// Low level utilities.
//

/** Assumes the hex code is valid. */
function hexToP3(hex: string): P3 {
  const [r, g, b] = parseHex(hex);
  return { mode: "p3", r: r / 255, g: g / 255, b: b / 255 };
}

/** Blind conversion; can return values outside the OKLCH range. */
function p3ToOklch(p3: P3): Oklch {
  // sRGB (with possibly out-of-range values).
  const rgb = convertXyz65ToRgb(convertP3ToXyz65(p3));
  const oklab = convertRgbToOklab(rgb);
  const lch = convertLabToLch(oklab);
  return { mode: "oklch", l: lch.l, c: lch.c, h: lch.h };
}

/** Blind conversion; can return values outside the P3 range, like "red=1.2". */
function oklchToP3(oklch: Oklch): P3 {
  const oklab = convertLchToLab(oklch);
  // sRGB (with possibly out-of-range values).
  const rgb = convertOklabToRgb(oklab);
  return convertXyz65ToP3(convertRgbToXyz65(rgb));
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

//
// Functions extracted from Culori to reduce final bundle size, which was 36K
// before, even using the ES modules version of Culori along with tree-shaking.
//
// Added some `any` types to hush TS.
//

const converters: any = {};
const modes: any = {};

const parsers: any = [];
const colorProfiles: any = {};

const getMode = (mode) => modes[mode];

export const useMode = (definition) => {
  converters[definition.mode] = {
    ...converters[definition.mode],
    ...definition.toMode,
  };

  Object.keys(definition.fromMode /*|| {}*/).forEach((k) => {
    if (!converters[k]) {
      converters[k] = {};
    }
    converters[k][definition.mode] = definition.fromMode[k];
  });

  // Color space channel ranges
  if (!definition.ranges) {
    definition.ranges = {};
  }

  if (!definition.difference) {
    definition.difference = {};
  }

  definition.channels.forEach((channel) => {
    // undefined channel ranges default to the [0, 1] interval
    if (definition.ranges[channel] === undefined) {
      definition.ranges[channel] = [0, 1];
    }

    // if (!definition.interpolate[channel]) {
    //   throw new Error(`Missing interpolator for: ${channel}`);
    // }

    if (typeof definition.interpolate[channel] === "function") {
      definition.interpolate[channel] = {
        use: definition.interpolate[channel],
      };
    }

    // if (!definition.interpolate[channel].fixup) {
    //   definition.interpolate[channel].fixup = identity;
    // }
  });

  modes[definition.mode] = definition;
  (definition.parse || []).forEach((parser) => {
    useParser(parser, definition.mode);
  });

  return converter(definition.mode);
};

const converter =
  (target_mode = "rgb") =>
  (color) =>
    // (color = prepare(color, target_mode)) !== undefined
    //   ? // if the color's mode corresponds to our target mode
    color.mode === target_mode
      ? // then just return the color
        color
      : // otherwise check to see if we have a dedicated
        // converter for the target mode
        // converters[color.mode][target_mode]
        // ? // and return its result...
        //   converters[color.mode][target_mode](color)
        // : // ...otherwise pass through RGB as an intermediary step.
        // // if the target mode is RGB...
        // target_mode === "rgb"
        // ? // just return the RGB
        //   converters[color.mode].rgb(color)
        // : // otherwise convert color.mode -> RGB -> target_mode
        converters.rgb[target_mode](converters[color.mode].rgb(color));
// : undefined;

const useParser = (parser, mode) => {
  // if (typeof parser === "string") {
  //   if (!mode) {
  //     throw new Error(`'mode' required when 'parser' is a string`);
  //   }
  colorProfiles[parser] = mode;
  // } else if (typeof parser === "function") {
  //   if (parsers.indexOf(parser) < 0) {
  //     parsers.push(parser);
  //   }
  // }
};

export const normalizeHue = (hue) => ((hue = hue % 360) < 0 ? hue + 360 : hue);

export const convertLabToLch = ({ l, a, b, alpha }: any, mode = "lch") => {
  let c = Math.sqrt(a * a + b * b);
  let res: any = { mode, l, c };
  if (c) res.h = normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
  if (alpha !== undefined) res.alpha = alpha;
  return res;
};

export const convertLchToLab = ({ l, c, h, alpha }: any, mode = "lab") => {
  let res: any = {
    mode,
    l,
    a: c ? c * Math.cos((h / 180) * Math.PI) : 0,
    b: c ? c * Math.sin((h / 180) * Math.PI) : 0,
  };
  if (alpha !== undefined) res.alpha = alpha;
  return res;
};

export const convertOklabToRgb = (c) => convertLrgbToRgb(convertOklabToLrgb(c));

export const convertLrgbToRgb = ({ r, g, b, alpha }: any, mode = "rgb") => {
  const fn = (c) => {
    const abs = Math.abs(c);
    if (abs > 0.0031308) {
      return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }
    return c * 12.92;
  };

  let res: any = {
    mode,
    r: fn(r),
    g: fn(g),
    b: fn(b),
  };
  if (alpha !== undefined) res.alpha = alpha;
  return res;
};

export const convertOklabToLrgb = ({ l, a, b, alpha }) => {
  let L = Math.pow(
    l * 0.99999999845051981432 + 0.39633779217376785678 * a + 0.21580375806075880339 * b,
    3,
  );
  let M = Math.pow(
    l * 1.0000000088817607767 - 0.1055613423236563494 * a - 0.063854174771705903402 * b,
    3,
  );
  let S = Math.pow(
    l * 1.0000000546724109177 - 0.089484182094965759684 * a - 1.2914855378640917399 * b,
    3,
  );

  let res: any = {
    mode: "lrgb",
    r: +4.076741661347994 * L - 3.307711590408193 * M + 0.230969928729428 * S,
    g: -1.2684380040921763 * L + 2.6097574006633715 * M - 0.3413193963102197 * S,
    b: -0.004196086541837188 * L - 0.7034186144594493 * M + 1.7076147009309444 * S,
  };

  if (alpha !== undefined) {
    res.alpha = alpha;
  }

  return res;
};

export const convertP3ToXyz65 = (rgb) => {
  let { r, g, b, alpha } = convertRgbToLrgb(rgb);
  let res: any = {
    mode: "xyz65",
    x: 0.486570948648216 * r + 0.265667693169093 * g + 0.1982172852343625 * b,
    y: 0.2289745640697487 * r + 0.6917385218365062 * g + 0.079286914093745 * b,
    z: 0.0 * r + 0.0451133818589026 * g + 1.043944368900976 * b,
  };
  if (alpha !== undefined) {
    res.alpha = alpha;
  }
  return res;
};

export const convertRgbToLrgb = ({ r, g, b, alpha }) => {
  const fn = (c) => {
    const abs = Math.abs(c);
    if (abs < 0.04045) {
      return c / 12.92;
    }
    return (Math.sign(c) || 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
  };

  let res: any = {
    mode: "lrgb",
    r: fn(r),
    g: fn(g),
    b: fn(b),
  };
  if (alpha !== undefined) res.alpha = alpha;
  return res;
};

export const convertRgbToOklab = (rgb) => {
  let res = convertLrgbToOklab(convertRgbToLrgb(rgb));
  if (rgb.r === rgb.b && rgb.b === rgb.g) {
    res.a = res.b = 0;
  }
  return res;
};

export const convertLrgbToOklab = ({ r, g, b, alpha }) => {
  let L = Math.cbrt(0.41222147079999993 * r + 0.5363325363 * g + 0.0514459929 * b);
  let M = Math.cbrt(0.2119034981999999 * r + 0.6806995450999999 * g + 0.1073969566 * b);
  let S = Math.cbrt(0.08830246189999998 * r + 0.2817188376 * g + 0.6299787005000002 * b);

  let res: any = {
    mode: "oklab",
    l: 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
    a: 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
    b: 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S,
  };

  if (alpha !== undefined) {
    res.alpha = alpha;
  }

  return res;
};

export const convertRgbToXyz65 = (rgb) => {
  let { r, g, b, alpha } = convertRgbToLrgb(rgb);
  let res: any = {
    mode: "xyz65",
    x: 0.4123907992659593 * r + 0.357584339383878 * g + 0.1804807884018343 * b,
    y: 0.2126390058715102 * r + 0.715168678767756 * g + 0.0721923153607337 * b,
    z: 0.0193308187155918 * r + 0.119194779794626 * g + 0.9505321522496607 * b,
  };
  if (alpha !== undefined) {
    res.alpha = alpha;
  }
  return res;
};

export const convertXyz65ToP3 = ({ x, y, z, alpha }) => {
  let res: any = convertLrgbToRgb(
    {
      r: x * 2.4934969119414263 - y * 0.9313836179191242 - 0.402710784450717 * z,
      g: x * -0.8294889695615749 + y * 1.7626640603183465 + 0.0236246858419436 * z,
      b: x * 0.0358458302437845 - y * 0.0761723892680418 + 0.9568845240076871 * z,
    },
    "p3",
  );
  if (alpha !== undefined) {
    res.alpha = alpha;
  }
  return res;
};

export const convertXyz65ToRgb = ({ x, y, z, alpha }: any) => {
  let res = convertLrgbToRgb({
    r: x * 3.2409699419045226 - y * 1.5373831775700939 - 0.4986107602930034 * z,
    g: x * -0.9692436362808796 + y * 1.8759675015077204 + 0.0415550574071756 * z,
    b: x * 0.0556300796969936 - y * 0.2039769588889765 + 1.0569715142428784 * z,
  });
  if (alpha !== undefined) {
    res.alpha = alpha;
  }
  return res;
};

// export const lerp = (a, b, t) => a + t * (b - a);

export const interpolatorPiecewise = (interpolator?: any) => {}; /*(arr) => {
  const get_classes = (arr) => {
    let classes: any = [];
    for (let i = 0; i < arr.length - 1; i++) {
      let a = arr[i];
      let b = arr[i + 1];
      if (a === undefined && b === undefined) {
        classes.push(undefined);
      } else if (a !== undefined && b !== undefined) {
        classes.push([a, b]);
      } else {
        classes.push(a !== undefined ? [a, a] : [b, b]);
      }
    }
    return classes;
  };

  let classes = get_classes(arr);
  return (t) => {
    let cls = t * classes.length;
    let idx = t >= 1 ? classes.length - 1 : Math.max(Math.floor(cls), 0);
    let pair = classes[idx];
    return pair === undefined
      ? undefined
      : interpolator(pair[0], pair[1], cls - idx);
  };
};*/

export const interpolatorLinear = interpolatorPiecewise(/*lerp*/);

// const hue = (hues, fn) => {
//   return hues
//     .map((hue, idx, arr) => {
//       if (hue === undefined) {
//         return hue;
//       }
//       let normalized = normalizeHue(hue);
//       if (idx === 0 || hues[idx - 1] === undefined) {
//         return normalized;
//       }
//       return fn(normalized - normalizeHue(arr[idx - 1]));
//     })
//     .reduce((acc, curr) => {
//       if (
//         !acc.length ||
//         curr === undefined ||
//         acc[acc.length - 1] === undefined
//       ) {
//         acc.push(curr);
//         return acc;
//       }
//       acc.push(curr + acc[acc.length - 1]);
//       return acc;
//     }, []);
// };

// export const fixupHueShorter = (arr) =>
//   hue(arr, (d) => (Math.abs(d) <= 180 ? d : d - 360 * Math.sign(d)));

// export const fixupAlpha = (arr) => {
//   let some_defined = false;
//   let res = arr.map((v) => {
//     if (v !== undefined) {
//       some_defined = true;
//       return v;
//     }
//     return 1;
//   });
//   return some_defined ? res : arr;
// };

export const lch = {
  mode: "lch",

  // toMode: {
  // 	lab: convertLchToLab,
  // 	rgb: c => convertLabToRgb(convertLchToLab(c))
  // },

  // fromMode: {
  // 	rgb: c => convertLabToLch(convertRgbToLab(c)),
  // 	lab: convertLabToLch
  // },

  channels: ["l", "c", "h", "alpha"],

  // ranges: {
  // 	l: [0, 100],
  // 	c: [0, 150],
  // 	h: [0, 360]
  // },

  // parse: [parseLch],
  // serialize: c =>
  // 	`lch(${c.l !== undefined ? c.l : 'none'} ${
  // 		c.c !== undefined ? c.c : 'none'
  // 	} ${c.h || 0}${c.alpha < 1 ? ` / ${c.alpha}` : ''})`,

  interpolate: {
    h: { use: interpolatorLinear /*fixup: fixupHueShorter*/ },
    c: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear /*fixup: fixupAlpha*/ },
  },

  difference: {
    // h: differenceHueChroma
  },

  average: {
    // h: averageAngle
  },
};

export const modeOklch = {
  ...lch,
  mode: "oklch",

  toMode: {
    // oklab: (c) => convertLchToLab(c, "oklab"),
    rgb: (c) => convertOklabToRgb(convertLchToLab(c, "oklab")),
  },

  fromMode: {
    rgb: (c) => convertLabToLch(convertRgbToOklab(c), "oklch"),
    // oklab: (c) => convertLabToLch(c, "oklch"),
  },

  // parse: [parseOklch],
  // serialize: c =>
  // 	`oklch(${c.l !== undefined ? c.l : 'none'} ${
  // 		c.c !== undefined ? c.c : 'none'
  // 	} ${c.h || 0}${c.alpha < 1 ? ` / ${c.alpha}` : ''})`,

  // ranges: {
  // 	l: [0, 1],
  // 	c: [0, 0.4],
  // 	h: [0, 360]
  // }
};

export const rgb = {
  mode: "rgb",
  channels: ["r", "g", "b", "alpha"],
  // parse: [
  // 	parseRgb,
  // 	parseHex,
  // 	parseRgbLegacy,
  // 	parseNamed,
  // 	parseTransparent,
  // 	'srgb'
  // ],
  serialize: "srgb",
  interpolate: {
    r: interpolatorLinear,
    g: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear /*fixup: fixupAlpha*/ },
  },
  gamut: true,
};

export const modeP3 = {
  ...rgb,
  mode: "p3",
  parse: ["display-p3"],
  serialize: "display-p3",

  fromMode: {
    rgb: (color) => convertXyz65ToP3(convertRgbToXyz65(color)),
    xyz65: convertXyz65ToP3,
  },

  toMode: {
    rgb: (color) => convertXyz65ToRgb(convertP3ToXyz65(color)),
    xyz65: convertP3ToXyz65,
  },
};

const differenceEuclidean = (mode = "rgb", weights = [1, 1, 1, 0]) => {
  let def = getMode(mode);
  let channels = def.channels;
  let diffs = def.difference;
  let conv = converter(mode);
  return (std, smp) => {
    let ConvStd = conv(std);
    let ConvSmp = conv(smp);
    return Math.sqrt(
      channels.reduce((sum, k, idx) => {
        let delta = diffs[k] ? diffs[k](ConvStd, ConvSmp) : ConvStd[k] - ConvSmp[k];
        return sum + (weights[idx] || 0) * Math.pow(isNaN(delta) ? 0 : delta, 2);
      }, 0),
    );
  };
};

const inrange_rgb = (c) => {
  return c !== undefined && c.r >= 0 && c.r <= 1 && c.g >= 0 && c.g <= 1 && c.b >= 0 && c.b <= 1;
};

export function inGamut(mode = "rgb") {
  const { gamut } = getMode(mode);
  // if (!gamut) {
  //   return (color) => true;
  // }
  const conv = converter(typeof gamut === "string" ? gamut : mode);
  return (color) => inrange_rgb(conv(color));
}

const prepare = (color: any, mode?: any) => color;
// color === undefined
//   ? undefined
//   : typeof color !== "object"
//   ? parse(color)
//   : color.mode !== undefined
//   ? color
//   : mode
//   ? { ...color, mode }
//   : undefined;

const fixup_rgb = (c) => {
  const res: any = {
    mode: c.mode,
    r: Math.max(0, Math.min(c.r, 1)),
    g: Math.max(0, Math.min(c.g, 1)),
    b: Math.max(0, Math.min(c.b, 1)),
  };
  if (c.alpha !== undefined) {
    res.alpha = c.alpha;
  }
  return res;
};

export function clampGamut(mode = "rgb") {
  const { gamut } = getMode(mode);
  // if (!gamut) {
  //   return (color) => prepare(color);
  // }
  const destMode = typeof gamut === "string" ? gamut : mode;
  const destConv = converter(destMode);
  const inDestGamut = inGamut(destMode);
  return (color) => {
    const original = prepare(color);
    if (!original) {
      return undefined;
    }
    const converted = destConv(original);
    if (inDestGamut(converted)) {
      return original;
    }
    const clamped = fixup_rgb(converted);
    if (original.mode === clamped.mode) {
      return clamped;
    }
    return converter(original.mode)(clamped);
  };
}

export function toGamut(
  dest = "rgb",
  mode = "oklch",
  delta = differenceEuclidean("oklch"),
  jnd = 0.02,
) {
  const destConv = converter(dest);

  // if (!getMode(dest).gamut) {
  //   return (color) => destConv(color);
  // }

  const inDestinationGamut = inGamut(dest);
  const clipToGamut = clampGamut(dest);

  const ucs = converter(mode);
  const { ranges } = getMode(mode);

  // const White = destConv("white");
  // const Black = destConv("black");

  return (color) => {
    color = prepare(color);
    // if (color === undefined) {
    //   return undefined;
    // }
    const candidate = { ...ucs(color) };
    // if (candidate.l >= ranges.l[1]) {
    //   const res = { ...White };
    //   if (color.alpha !== undefined) {
    //     res.alpha = color.alpha;
    //   }
    //   return res;
    // }
    // if (candidate.l <= ranges.l[0]) {
    //   const res = { ...Black };
    //   if (color.alpha !== undefined) {
    //     res.alpha = color.alpha;
    //   }
    //   return res;
    // }
    if (inDestinationGamut(candidate)) {
      return destConv(candidate);
    }
    let start = 0;
    let end = candidate.c;
    let epsilon = (ranges.c[1] - ranges.c[0]) / 4000; // 0.0001 for oklch()
    let clipped = clipToGamut(candidate);
    while (end - start > epsilon) {
      candidate.c = (start + end) * 0.5;
      clipped = clipToGamut(candidate);
      if (inDestinationGamut(candidate) || (jnd > 0 && delta(candidate, clipped) <= jnd)) {
        start = candidate.c;
      } else {
        end = candidate.c;
      }
    }
    return destConv(inDestinationGamut(candidate) ? candidate : clipped);
  };
}
