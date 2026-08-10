import { gradientColor, hexColor, HexColorBuilder, varColor, VarColorBuilder } from "./builders.js";
import { formatOklch, parseOklch } from "./oklch.js";

export * from "./builders.js";

export { gradientColor, hexColor, varColor, type ColorBuilder } from "./builders.js";

// Default Crosswing colors.
// Isomorphic.

// Abandon all hope, ye who enter here.

/** A set of neutral-toned colors used by shared components. */
const neutrals = {
  black: hexColor("#000000"),
  white: hexColor("#FFFFFF"),

  // Inspired by Tailwind's "neutrals" scale.
  neutral50: hexColor("#fafafa"),
  neutral100: hexColor("#f5f5f5"),
  neutral150: hexColor("#eaeaea"),
  neutral200: hexColor("#e5e5e5"),
  neutral250: hexColor("#d9d9d9"),
  neutral300: hexColor("#d4d4d4"),
  neutral350: hexColor("#c4c4c4"),
  neutral400: hexColor("#a3a3a3"),
  neutral450: hexColor("#878787"),
  neutral500: hexColor("#737373"),
  neutral550: hexColor("#666666"),
  neutral600: hexColor("#525252"),
  neutral650: hexColor("#454545"),
  neutral700: hexColor("#404040"),
  neutral750: hexColor("#323232"),
  neutral800: hexColor("#262626"),
  neutral850: hexColor("#1f1f1f"),
  neutral900: hexColor("#171717"),
  neutral950: hexColor("#0a0a0a"),

  /** @deprecated Use gray950 instead. */
  extraExtraExtraDarkGray: hexColor("#030303"),
  /** @deprecated Use gray950 instead. */
  extraExtraDarkGray: hexColor("#0D0D0D"),
  /** @deprecated Use gray900 instead. */
  extraDarkGray: hexColor("#1A1A1A"),
  /** @deprecated Use gray500 instead. */
  darkerGray: hexColor("#878787"),
  /** @deprecated Use gray400 instead. */
  darkGray: hexColor("#959595"),
  /** @deprecated Use gray300 instead. */
  mediumGray: hexColor("#BABABA"),
  /** @deprecated Use gray200 instead. */
  lightGray: hexColor("#E3E3E3"),
  /** @deprecated Use gray50 instead. */
  extraLightGray: hexColor("#F9F9F9"),
};

/** A set of opinionated colors. */
const other = {
  /** @deprecated Use gray800 instead. */
  darkGreen: hexColor("#323232"),
  turquoise: hexColor("#32BBAB"),
  turquoiseDark: hexColor("#16B4BD"),
  turquoiseGradient: gradientColor("to right", "#32BB94", "#16B4BD"),
  extraLightTurquoise: hexColor("#F5FAF9"),
  /** @deprecated Use green instead. */
  lime: hexColor("#90D98B"),
  green: hexColor("#90D98B"),
  gold: hexColor("#E0B475"),
  yellow: hexColor("#e5b20e"),
  orange: hexColor("#FB5525"),
  orangeGradient: gradientColor("to right", "#FB6225", "#FB3025"),
  cream: hexColor("#FCF8EE"),
  pink: hexColor("#F09CAB"),
  red: hexColor("#F2584D"),
  darkBlue: hexColor("#2B7DA5"),
  mediumBlue: hexColor("#7CB8D6"),
  blue: hexColor("#7CB8D6"),
  lightBlue: hexColor("#8ED2F4"),
  babyBlue: hexColor("#D0E9F5"),
  blueGradient: gradientColor("to right", "#2B86A5", "#2671A7"),
  purple: hexColor("#5765A1"),
  extraDarkBlue: hexColor("#0c2c3c"),
  extraDarkTurquoise: hexColor("#194e48"),
};

/**
 * A wide set of truly neutral grays that are pre-baked as vars so you can
 * override them to "tint" them subtly if you wish.
 */
const grays = {
  gray50: varColor({ light: neutrals.neutral50.rgb, var: "--gray-50" }),
  gray100: varColor({ light: neutrals.neutral100.rgb, var: "--gray-100" }),
  gray150: varColor({ light: neutrals.neutral150.rgb, var: "--gray-150" }),
  gray200: varColor({ light: neutrals.neutral200.rgb, var: "--gray-200" }),
  gray250: varColor({ light: neutrals.neutral250.rgb, var: "--gray-250" }),
  gray300: varColor({ light: neutrals.neutral300.rgb, var: "--gray-300" }),
  gray350: varColor({ light: neutrals.neutral350.rgb, var: "--gray-350" }),
  gray400: varColor({ light: neutrals.neutral400.rgb, var: "--gray-400" }),
  gray450: varColor({ light: neutrals.neutral450.rgb, var: "--gray-450" }),
  gray500: varColor({ light: neutrals.neutral500.rgb, var: "--gray-500" }),
  gray550: varColor({ light: neutrals.neutral550.rgb, var: "--gray-550" }),
  gray600: varColor({ light: neutrals.neutral600.rgb, var: "--gray-600" }),
  gray650: varColor({ light: neutrals.neutral650.rgb, var: "--gray-650" }),
  gray700: varColor({ light: neutrals.neutral700.rgb, var: "--gray-700" }),
  gray750: varColor({ light: neutrals.neutral750.rgb, var: "--gray-750" }),
  gray800: varColor({ light: neutrals.neutral800.rgb, var: "--gray-800" }),
  gray850: varColor({ light: neutrals.neutral850.rgb, var: "--gray-850" }),
  gray900: varColor({ light: neutrals.neutral900.rgb, var: "--gray-900" }),
  gray950: varColor({ light: neutrals.neutral950.rgb, var: "--gray-950" }),
} as const;

/**
 * A set of responsive colors that auto-adjust for light/dark modes. These
 * cannot be adjusted like hexColor() can, because they are "pre-baked" into
 * the CSS for light/dark mode, but you can adjust their alpha when using them.
 */
const responsive = {
  primary: varColor({ light: other.turquoise.rgb, var: "--primary-color" }),
  primaryDark: varColor({
    light: other.turquoiseDark,
    var: "--primary-color-dark",
  }),
  text: varColor({
    light: grays.gray900.staticVar,
    dark: neutrals.white.rgb,
    var: "--text-color",
  }),
  textSecondary: varColor({
    light: grays.gray500.staticVar,
    dark: grays.gray350.staticVar,
    var: "--text-secondary-color",
  }),
  textBackground: varColor({
    light: neutrals.white.rgb,
    dark: grays.gray800.staticVar,
    var: "--text-background-color",
  }),
  /** Suitable for panels that appear further from the viewer than the page background. */
  textBackgroundPanel: varColor({
    light: grays.gray100.staticVar,
    dark: grays.gray900.staticVar,
    var: "--text-background-panel-color",
  }),
  /** Different flavor of textBackground, suitable for alternating table rows. */
  textBackgroundAlt: varColor({
    light: grays.gray50.staticVar,
    dark: grays.gray750.staticVar,
    var: "--text-background-alt-color",
  }),
  /** Suitable for borders around controls. Static because the alpha is baked in. */
  controlBorder: varColor({
    light: grays.gray400({ alpha: 0.4 }),
    dark: grays.gray500({ alpha: 0.4 }),
    var: "--control-border-color",
    static: true,
  }),
  /** Static because the alpha is baked in. */
  separator: varColor({
    light: neutrals.black({ alpha: 0.075 }),
    dark: neutrals.white({ alpha: 0.075 }),
    var: "--separator-color",
    static: true,
  }),
  /** Meant for hover state on buttons with borders, less strong than buttonBackgroundHover. */
  buttonBackgroundGlow: varColor({
    light: grays.gray900({ alpha: 0.03 }),
    dark: neutrals.white({ alpha: 0.05 }),
    var: "--button-background-glow-color",
    static: true,
  }),
  /** Meant for hover state on buttons without borders. */
  buttonBackgroundHover: varColor({
    light: grays.gray900({ alpha: 0.075 }),
    dark: neutrals.white({ alpha: 0.1 }),
    var: "--button-background-hover-color",
    static: true,
  }),
  /** Meant for active (i.e. "you are here") links. */
  linkActiveBackground: varColor({
    light: grays.gray900({ alpha: 0.1 }),
    dark: neutrals.white({ alpha: 0.15 }),
    var: "--link-active-background-color",
    static: true,
  }),
};

/** Gradients that go well with the default colors. */
const gradients = {
  primaryGradient: varColor({
    light: other.turquoiseGradient(),
    var: "--primary-gradient",
    static: true,
  }),
};

export const colors = {
  ...neutrals,
  ...other,
  ...grays,
  ...responsive,
  ...gradients,
};

export const shadows = {
  card: varColor({
    light: `0px 4px 12px ${grays.gray800({ alpha: 0.2 })}`,
    dark: `0px 4px 12px ${neutrals.black()}`,
    var: "--card-shadow",
    static: true,
  }),
  cardSmall: varColor({
    light: `0px 1px 4px ${grays.gray800({ alpha: 0.2 })}`,
    dark: `0px 1px 4px ${neutrals.black()}`,
    var: "--card-small-shadow",
    static: true,
  }),
  cardSmaller: varColor({
    light: `0px 1px 2px ${grays.gray800({ alpha: 0.2 })}`,
    dark: `0px 1px 2px ${neutrals.black()}`,
    var: "--card-smaller-shadow",
    static: true,
  }),
  cardBorder: varColor({
    light: `0px 0px 0px 1px ${grays.gray800({ alpha: 0.07 })}`,
    dark: `0px 0px 0px 1px ${neutrals.black({ alpha: 0.2 })}`,
    var: "--card-border-shadow",
    static: true,
  }),
  /* Good for layering on top of images to give them a subtle border when they are otherwise "floating" on a page. */
  imageBorder: varColor({
    light: `inset 0 0 0 1px ${neutrals.black({ alpha: 0.1 })}`,
    dark: `inset 0 0 0 1px ${neutrals.white({ alpha: 0.05 })}`,
    var: "--image-border-shadow",
    static: true,
  }),
  popup: varColor({
    light: `0px 4px 12px ${grays.gray800({ alpha: 0.2 })}`,
    dark: `0px 4px 12px ${neutrals.black({ alpha: 0.4 })}`,
    var: "--popup-shadow",
    static: true,
  }),
  popupBorder: varColor({
    light: `0 0 0 1px ${grays.gray300()}`,
    dark: `0 0 0 1px ${grays.gray600()}`,
    var: "--popup-border-shadow",
    static: true,
  }),
};

/**
 * Tint a neutral color with a given color.
 *
 * @param neutral - The neutral color to tint.
 * @param tint - The color from which to pull the hue.
 * @param chroma - The fixed chroma to apply to the final color.
 */
export function tintNeutral({
  neutral,
  tint,
  chroma = 0.003,
}: {
  neutral: HexColorBuilder;
  tint: HexColorBuilder;
  chroma?: number;
}): HexColorBuilder {
  const oklch = parseOklch(neutral.hex);
  oklch.c = chroma;
  oklch.h = parseOklch(tint.hex).h;
  return hexColor(formatOklch(oklch));
}

/**
 * Override the system grays with a given color.
 *
 * @param tint - The color from which to pull the hue.
 * @param chroma - The fixed chroma to apply to the final color.
 */
export function overrideGrays({
  tint,
  chroma,
}: {
  tint: HexColorBuilder;
  chroma?: number;
}): VarColorBuilder[] {
  return [
    colors.gray50.override(tintNeutral({ tint, neutral: neutrals.neutral50, chroma })),
    colors.gray100.override(tintNeutral({ tint, neutral: neutrals.neutral100, chroma })),
    colors.gray150.override(tintNeutral({ tint, neutral: neutrals.neutral150, chroma })),
    colors.gray200.override(tintNeutral({ tint, neutral: neutrals.neutral200, chroma })),
    colors.gray250.override(tintNeutral({ tint, neutral: neutrals.neutral250, chroma })),
    colors.gray300.override(tintNeutral({ tint, neutral: neutrals.neutral300, chroma })),
    colors.gray350.override(tintNeutral({ tint, neutral: neutrals.neutral350, chroma })),
    colors.gray400.override(tintNeutral({ tint, neutral: neutrals.neutral400, chroma })),
    colors.gray450.override(tintNeutral({ tint, neutral: neutrals.neutral450, chroma })),
    colors.gray500.override(tintNeutral({ tint, neutral: neutrals.neutral500, chroma })),
    colors.gray550.override(tintNeutral({ tint, neutral: neutrals.neutral550, chroma })),
    colors.gray600.override(tintNeutral({ tint, neutral: neutrals.neutral600, chroma })),
    colors.gray650.override(tintNeutral({ tint, neutral: neutrals.neutral650, chroma })),
    colors.gray700.override(tintNeutral({ tint, neutral: neutrals.neutral700, chroma })),
    colors.gray750.override(tintNeutral({ tint, neutral: neutrals.neutral750, chroma })),
    colors.gray800.override(tintNeutral({ tint, neutral: neutrals.neutral800, chroma })),
    colors.gray850.override(tintNeutral({ tint, neutral: neutrals.neutral850, chroma })),
    colors.gray900.override(tintNeutral({ tint, neutral: neutrals.neutral900, chroma })),
    colors.gray950.override(tintNeutral({ tint, neutral: neutrals.neutral950, chroma })),
    // Also override colors that use the grays.
    colors.buttonBackgroundHover.override(
      tintNeutral({
        neutral: colors.neutral600,
        tint,
        chroma: 0.04,
      })({ alpha: 0.075 }),
      {
        dark: tintNeutral({
          neutral: colors.neutral300,
          tint,
          chroma: 0.02,
        })({ alpha: 0.1 }),
      },
    ),
    colors.buttonBackgroundGlow.override(
      tintNeutral({
        neutral: colors.neutral600,
        tint,
        chroma: 0.5,
      })({ alpha: 0.05 }),
      {
        dark: tintNeutral({
          neutral: colors.neutral300,
          tint,
          chroma: 0.02,
        })({ alpha: 0.05 }),
      },
    ),
    colors.linkActiveBackground.override(
      tintNeutral({
        neutral: colors.neutral600,
        tint,
        chroma: 0.08,
      })({ alpha: 0.1 }),
      {
        dark: tintNeutral({
          neutral: colors.neutral300,
          tint,
          chroma: 0.02,
        })({ alpha: 0.15 }),
      },
    ),
  ];
}
