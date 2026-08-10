import { createGlobalStyle } from "styled-components";

/** Top-level styles for a mobile app rendered with Crosswing. */
export const CrosswingRootStyle = createGlobalStyle`
  html {
    height: 100%;

    /* Make the site nice on mobile. */
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-font-smoothing: antialiased;
  }

  body {
    height: 100%;
    margin: 0;
    display: flex;
    flex-flow: column;

    /* The main <div> you're rendering your Crosswing app into. */
    > #root {
      flex-grow: 1;
      display: flex;
      flex-flow: column;
  
      /* Whatever *its* child is. */
      > * {
        flex-grow: 1;
      }
    }
    
    b, strong {
      /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
      font-weight: 600;
    }
  }
`;

/**
 * When viewing the mobile app on a desktop browser, this will
 * "frame" it so the UI doesn't appear stretched.
 */
export const CrosswingAppDesktopFrame = createGlobalStyle`
  @media (min-width: 500px) {
    body > #root {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background: #cdd6d6;

      @media (prefers-color-scheme: dark) {
        background: #3C4444; /* From Figma */
      }

      > * {
        /* Approximate the visible content area of an iPhone 12 Pro. */
        width: 390px;
        max-height: 715px;
      }
    }
  }
`;

/** Top-level styles for a desktop website rendered with Crosswing. */
export const CrosswingDesktopRootStyle = createGlobalStyle`
  html {
    height: 100%;

    /* Make the site nice on mobile. */
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-font-smoothing: antialiased;
  }

  body {
    height: 100%;
    margin: 0;
    display: flex;
    flex-flow: column;
  }

  /* The main <div> you're rendering your Crosswing app into. */
  body > #root {
    flex-grow: 1;
    display: flex;
    flex-flow: column;

    /* Whatever *its* child is. */
    > * {
      flex-grow: 1;
    }
  }

  b, strong {
    /* Otherwise browsers may select the "Fira Sans Black" font which is too heavy. */
    font-weight: 600;
  }
`;
