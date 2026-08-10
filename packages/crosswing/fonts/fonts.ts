import { useEffect } from "react";
import { dedent } from "../shared/strings";
import FiraMonoMedium from "./fira-mono/FiraMono-Medium.woff2";
import FiraMonoRegular from "./fira-mono/FiraMono-Regular.woff2";
import Firava from "./firava/Firava.woff2";
import FiravaItalic from "./firava/FiravaItalic.woff2";
import LatoBlack from "./lato/Lato-Black.woff2";
import LatoBold from "./lato/Lato-Bold.woff2";
import LatoRegular from "./lato/Lato-Regular.woff2";

export type GlobalFontFace = {
  url?: string;
  variable?: boolean;
  family: string;
  weight: string;
  style: string;
  fallback: string;
};

export const faces = {
  firava: {
    url: Firava,
    variable: true,
    family: "Fira Sans",
    weight: "100 900",
    style: "normal",
    fallback: "sans-serif",
  },
  firavaItalic: {
    url: FiravaItalic,
    variable: true,
    family: "Fira Sans Italic",
    weight: "100 900",
    style: "italic",
    fallback: "sans-serif",
  },
  latoRegular: {
    url: LatoRegular,
    family: "Lato",
    weight: "400",
    style: "normal",
    fallback: "sans-serif",
  },
  latoBold: {
    url: LatoBold,
    family: "Lato",
    weight: "600",
    style: "normal",
    fallback: "sans-serif",
  },
  latoBlack: {
    url: LatoBlack,
    family: "Lato",
    weight: "800",
    style: "normal",
    fallback: "sans-serif",
  },
  displayMono: {
    url: FiraMonoRegular,
    family: "Fira Mono",
    weight: "400",
    style: "normal",
    fallback: "monospace",
  },
  displayMonoMedium: {
    url: FiraMonoMedium,
    family: "Fira Mono",
    weight: "500",
    style: "normal",
    fallback: "monospace",
  },
} satisfies Record<string, GlobalFontFace>;

export const fonts = {
  display: font({ face: faces.firava, var: "--font-display", weight: "400" }),
  displayItalic: font({
    face: faces.firavaItalic,
    var: "--font-display-italic",
    weight: "400",
    style: "italic",
  }),
  displayMedium: font({
    face: faces.firava,
    var: "--font-display-medium",
    weight: "500",
  }),
  displayBold: font({
    face: faces.firava,
    var: "--font-display-bold",
    weight: "600",
  }),
  displayBlack: font({
    face: faces.firava,
    var: "--font-display-black",
    weight: "800",
  }),
  numeric: font({ face: faces.latoRegular, var: "--font-numeric" }),
  numericBold: font({ face: faces.latoBold, var: "--font-numeric-bold" }),
  numericBlack: font({ face: faces.latoBlack, var: "--font-numeric-black" }),
  displayMono: font({ face: faces.displayMono, var: "--font-display-mono" }),
  displayMonoMedium: font({
    face: faces.displayMonoMedium,
    var: "--font-display-mono-medium",
  }),
} satisfies Record<string, FontBuilder>;

/** A React component that installs Crosswing font faces automatically. */
export function CrosswingFontFaceStyle({ faces }: { faces: GlobalFontFace[] }) {
  useEffect(() => {
    // We want to render our fonts statically only once, to work around
    // flickering during development: https://github.com/styled-components/styled-components/issues/1593#issuecomment-409011695

    // Look for any existing style tag.
    let style = document.head.querySelector("style#crosswing-font-faces");

    const css = getFontFaceCSS(Object.values(faces));

    if (style) {
      // Check if the CSS has changed.
      if (style.innerHTML !== css) {
        style.innerHTML = css;
      }
    } else {
      style = document.createElement("style");
      style.id = "crosswing-font-faces";
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }, []);

  return null;
}

export interface FontOptions {
  size: number;
  line?: string;
  /** Prevents automatic font scaling. */
  fixed?: boolean;
}

export type FontBuilder = {
  (options: FontOptions): string;
  face: GlobalFontFace;
  var: string;
  family?: string;
  weight?: string;
  style?: string;
  fallback?: string;
  url?: string;
  override({
    face,
    family,
    weight,
    style,
    fallback,
  }: {
    face?: GlobalFontFace;
    family?: string;
    weight?: string;
    style?: string;
    fallback?: string;
  }): FontBuilder;
};

export function font({
  var: cssVar,
  face,
  family,
  weight,
  style,
  fallback,
}: {
  var: string;
  face: GlobalFontFace;
  // Overrides the values in the GlobalFontFace if provided.
  family?: string;
  weight?: string;
  style?: string;
  fallback?: string;
}): FontBuilder {
  const builder = ({ size, line, fixed }: FontOptions) => {
    // You can define the CSS var "--font-scale" to globally scale up or
    // down fonts created with FontBuilder. This is how we handle adjusting the
    // entire UI for accessibility.
    const scaledSize = fixed ? `${size}px` : `calc(${size}px * var(--font-scale, 1))`;

    // Scale the line size if you defined it in points.
    const scaledLine =
      !fixed && (line ?? "").endsWith("px")
        ? `calc(${line} * var(--font-scale, 1))`
        : (line ?? "normal");

    return `var(${cssVar}-style) var(${cssVar}-weight) ${scaledSize} / ${scaledLine} var(${cssVar}-family), var(${cssVar}-fallback)`;
  };

  builder.face = face;
  builder.var = cssVar;
  builder.family = family;
  builder.weight = weight;
  builder.style = style;
  builder.fallback = fallback;
  builder.override = ({ face, family, weight, style, fallback }) => {
    return font({
      var: cssVar,
      face,
      family,
      weight,
      style,
      fallback,
    });
  };

  return builder;
}

export function getFontFaceCSS(faces: GlobalFontFace[]) {
  let css = "";

  for (const { url, variable, family, weight, style } of faces) {
    if (!url) continue; // System font, no @font-face needed.

    if (variable) {
      css += dedent(`
        @font-face {
          font-family: '${family}';
          src: url('${url}') format('woff2-variations');
          src: url('${url}') format('woff2') tech(variations);
          font-weight: ${weight};
          font-style: ${style};
        }
      `);
    } else {
      css += dedent(`
        @font-face {
          font-family: '${family}';
          src: url('${url}') format('truetype');
          font-weight: ${weight};
          font-style: ${style};
        }
      `);
    }
  }

  return css;
}

export function getFontVarCSS(fonts: FontBuilder[]) {
  let css = "";

  for (const font of fonts) {
    css += dedent(`
      ${font.var}-family: ${font.family ?? font.face.family};
      ${font.var}-weight: ${font.weight ?? font.face.weight};
      ${font.var}-style: ${font.style ?? font.face.style};
      ${font.var}-fallback: ${font.face.fallback};
    `);
  }

  return css;
}
