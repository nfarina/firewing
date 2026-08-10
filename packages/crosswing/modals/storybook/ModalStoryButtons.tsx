import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

// We don't want to introduce a circular dependency between `components`
// and `modals`, so we can't use our standard Button.

export const ModalStoryButton = styled.button`
  display: flex;
  flex-flow: row;
  cursor: pointer;
  background: ${colors.primaryGradient()};
  box-sizing: border-box;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  color: ${colors.white()};
  font: ${fonts.displayBold({ size: 15 })};
  align-items: center;
  justify-content: center;
`;

export const ModalStoryButtons = styled.div`
  background: ${colors.textBackground()};
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  > * + * {
    margin-top: 10px;
  }
`;
