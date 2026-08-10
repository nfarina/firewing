import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";

/**
 * Useful for hosting a form using mobile components in a desktop setting.
 */
export const DesktopFormLayout = styled.div`
  display: flex;

  > * {
    flex-grow: 1;
  }

  align-items: flex-start;
  background: ${colors.textBackgroundAlt()};

  > * {
    box-sizing: border-box; /* Needed for height: 100% */
    width: 100%;
    height: 100%;
    max-width: 390px;
    background: ${colors.textBackground()};
    box-shadow: 1px 0 0 ${colors.separator()};

    /* If <ListLayout> collapses, then don't clip our width. */
    @media (max-width: 950px) {
      max-width: unset;
    }
  }
`;
