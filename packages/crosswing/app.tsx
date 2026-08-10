import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { getBuilderVarCSS } from "./colors/builders.js";
import { ColorBuilder, colors, shadows } from "./colors/colors.js";
import {
  CrosswingFontFaceStyle,
  faces,
  FontBuilder,
  fonts,
  getFontVarCSS,
  GlobalFontFace,
} from "./fonts/fonts.js";
import { BROWSER_SAFE_AREA, getSafeAreaCSS, SafeArea } from "./safearea/safeArea.js";

export function CrosswingApp({
  colors: overriddenColors = [],
  faces: overriddenFaces = [],
  fonts: overriddenFonts = [],
  safeArea: overriddenSafeArea = BROWSER_SAFE_AREA,
  children,
  transparent,
  ...rest
}: {
  colors?: ColorBuilder[];
  faces?: GlobalFontFace[];
  fonts?: FontBuilder[];
  safeArea?: SafeArea;
  transparent?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  const resolvedColors = [...Object.values(colors), ...Object.values(shadows), ...overriddenColors];

  const resolvedFaces = [...Object.values(faces), ...overriddenFaces];
  const resolvedFonts = [...Object.values(fonts), ...overriddenFonts];

  return (
    <StyledCrosswingApp
      $colors={resolvedColors}
      $fonts={resolvedFonts}
      $safeArea={overriddenSafeArea}
      data-transparent={!!transparent}
      {...rest}
    >
      <CrosswingFontFaceStyle faces={resolvedFaces} />
      {children}
    </StyledCrosswingApp>
  );
}

export const StyledCrosswingApp = styled.div<{
  $colors: ColorBuilder[];
  $fonts: FontBuilder[];
  $safeArea: SafeArea;
}>`
  /* I try hard to avoid props in styled-components but this is the only
     practical way to embed CSS at the element level. */
  ${(p) => getBuilderVarCSS(p.$colors)}
  ${(p) => getFontVarCSS(p.$fonts)}
  ${(p) => getSafeAreaCSS(p.$safeArea)}

  &[data-transparent="false"] {
    background: ${colors.textBackground()};
  }

  color: ${colors.text()};
  font: ${fonts.display({ size: 14 })};
  display: flex;
  flex-flow: column;

  > * {
    flex-grow: 1;
  }
`;
