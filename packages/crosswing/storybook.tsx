import { useEffect } from "react";
import { createGlobalStyle, styled } from "styled-components";
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
import { useFontSizeHotKeys } from "./host/features/useFontSizeHotKeys.js";

/**
 * Decorator that injects Crosswing global styles into the storybook environment.
 * Accepts optional parameters controlling the rendering behavior.
 */
export function CrosswingAppDecorator({
  layout = "centered",
  colors: overriddenColors = [],
  faces: overriddenFaces = [],
  fonts: overriddenFonts = [],
  background = null,
}: {
  layout?: "fullscreen" | "centered" | "mobile" | "component";
  colors?: ColorBuilder[];
  faces?: GlobalFontFace[];
  fonts?: FontBuilder[];
  background?: ColorBuilder | null;
} = {}) {
  const resolvedColors = [...Object.values(colors), ...Object.values(shadows), ...overriddenColors];

  const resolvedFaces = [...Object.values(faces), ...overriddenFaces];
  const resolvedFonts = [...Object.values(fonts), ...overriddenFonts];

  // Actual decorator function.
  function CrosswingAppInnerDecorator(Story: () => any) {
    useEffect(() => {
      // Tag the body with the layout so we can style it correctly in vitest.
      document.body.dataset.layout = layout;

      // Also make the draggable root the body so you can useDraggable.
      document.body.dataset.draggableRoot = "true";
    }, [layout]);

    // Allow the user to change the font size with hotkeys for testing
    // responsive layouts.
    useFontSizeHotKeys();

    return (
      <>
        <CrosswingFontFaceStyle faces={resolvedFaces} />
        {layout === "centered" && (
          <CenteredLayoutGlobalStyle
            $colors={resolvedColors}
            $fonts={resolvedFonts}
            $background={background}
          />
        )}
        {layout === "component" && (
          <ComponentLayoutGlobalStyle
            $colors={resolvedColors}
            $fonts={resolvedFonts}
            $background={background}
          />
        )}
        {layout === "mobile" && (
          <MobileLayoutGlobalStyle
            $colors={resolvedColors}
            $fonts={resolvedFonts}
            $background={background}
          />
        )}
        {layout === "fullscreen" && (
          <FullScreenLayoutGlobalStyle
            $colors={resolvedColors}
            $fonts={resolvedFonts}
            $background={background}
          />
        )}
        <Story />
      </>
    );
  }

  return CrosswingAppInnerDecorator;
}

const CenteredLayoutGlobalStyle = createGlobalStyle<{
  $colors: ColorBuilder[];
  $fonts: FontBuilder[];
  $background?: ColorBuilder | null;
}>`
  html {
    > body {
    /* Define our color and font vars so stories have access to the default theme. */
    ${(p) => getBuilderVarCSS(p.$colors)}
    ${(p) => getFontVarCSS(p.$fonts)}

      /* We should always set a default background color; Storybook doesn't do it automatically for dark mode. */
      background: ${(p) => p.$background?.() ?? colors.textBackground()};

      /* Make raw text readable. */
      color: ${colors.text()};
      font: ${fonts.display({ size: 14 })};

      > #storybook-root {
      }
    }
  }

  b, strong {
    /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
    font-weight: 600;
  }
`;

const ComponentLayoutGlobalStyle = createGlobalStyle<{
  $colors: ColorBuilder[];
  $fonts: FontBuilder[];
  $background?: ColorBuilder | null;
}>`
  html {
    > body {
    /* Define our color and font vars so stories have access to the default theme. */
    ${(p) => getBuilderVarCSS(p.$colors)}
    ${(p) => getFontVarCSS(p.$fonts)}

      /* We should always set a default background color; Storybook doesn't do it automatically for dark mode. */
      background: ${(p) => p.$background?.() ?? colors.textBackground()};

      /* Make raw text readable. */
      color: ${colors.text()};
      font: ${fonts.display({ size: 14 })};

      > #storybook-root {
        /* Match the width of MobileLayoutGlobalStyle. */
        width: 390px;
        padding: 0 !important;
      }
    }
  }

  b, strong {
    /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
    font-weight: 600;
  }
`;

const MobileLayoutGlobalStyle = createGlobalStyle<{
  $colors: ColorBuilder[];
  $fonts: FontBuilder[];
  $background?: ColorBuilder | null;
}>`
  html {
    height: 100%;

    > body {
      height: 100%;

    /* Define our color and font vars so stories have access to the default theme. */
    ${(p) => getBuilderVarCSS(p.$colors)}
    ${(p) => getFontVarCSS(p.$fonts)}

      /* Darken the canvas a bit so the default white background contrasts. */
      background: ${(p) => p.$background?.() ?? "#E5E5E5"};

      @media (prefers-color-scheme: dark) {
        background: ${(p) => p.$background?.() ?? "#404040"};
      }

      > #storybook-root {
        /* Approximate the visible content area of an iPhone 12 Pro. */
        width: 390px;
        height: 715px;
        overflow: auto;

        /* Make the height shrink down to the viewport. Typically I'm developing with Chrome DevTools open and don't have a lot of height to work with. */
        max-height: 100%;
        display: flex;
        flex-flow: column;

        /* Override Storybook's "centered" layout padding to get more space on my small MacBook Air screen. */
        padding: 0 !important;

        /* Make the mobile frame stand out from the default Storybook background. */
        background: ${colors.textBackground()};

        /* StyledCrosswingApp provides a default color. */
        color: ${colors.text()};

        /* Rendered story itself. */
        > * {
          flex-grow: 1;
        }
      }
    }
  }

  b, strong {
    /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
    font-weight: 600;
  }
`;

const FullScreenLayoutGlobalStyle = createGlobalStyle<{
  $colors: ColorBuilder[];
  $fonts: FontBuilder[];
  $background?: ColorBuilder | null;
}>`
  html {
    height: 100%;
  }

  body {
    height: 100%;

    /* Define our color and font vars so stories have access to the default theme. */
    ${(p) => getBuilderVarCSS(p.$colors)}
    ${(p) => getFontVarCSS(p.$fonts)}

    /* We should always set a default background color; Storybook doesn't do it automatically for dark mode. */
    background: ${(p) => p.$background?.() ?? colors.textBackground()};

    > #storybook-root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column;

      /* StyledCrosswingApp provides a default color. */
      color: ${colors.text()};

      /* Rendered story itself. */
      > * {
        flex-grow: 1;
        max-width: 100%;
        max-height: 100%;
      }
    }
  }

  b, strong {
    /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
    font-weight: 600;
  }
`;

/**
 * A convenience decorator that centers your story inside a container with
 * some optional padding. Designed to be used with
 * CrosswingAppDecorator({layout: "mobile"}).
 */
export function MobileComponentDecorator({ padding = 0 }: { padding?: string | number } = {}) {
  return (Story: () => any) => (
    <MobileComponentContainer style={{ padding }} children={<Story />} />
  );
}

const MobileComponentContainer = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  box-sizing: border-box;
`;
