import { createGlobalStyle } from "styled-components";
import { viewportContainer } from "./viewport/viewport.js";

/** Top-level styles for a mobile app rendered with Crosswing. */
export const CrosswingRootStyle = createGlobalStyle`
  html {
    height: 100%;

    /* Make the site nice on mobile. */
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  body {
    height: 100%;
    margin: 0;
    display: flex;
    flex-flow: column;
    /* What width-dependent styles respond to (see viewportContainer). */
    ${viewportContainer}

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

/** Top-level styles for a desktop website rendered with Crosswing. */
export const CrosswingDesktopRootStyle = createGlobalStyle`
  html {
    height: 100%;

    /* Make the site nice on mobile. */
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  body {
    height: 100%;
    margin: 0;
    display: flex;
    flex-flow: column;
    /* What width-dependent styles respond to (see viewportContainer). Without
       it, every \`@container viewport\` query stays unmatched and components
       keep their widest layout at any width. */
    ${viewportContainer}
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
