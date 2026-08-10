import { CSSProperties, HTMLAttributes } from "react";
import { keyframes, styled } from "styled-components";
import { ColorBuilder, colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { easing } from "../../shared/easing.js";

export function UnreadBadge({
  children,
  style,
  color = colors.white,
  backgroundColor = colors.red,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "color" | "backgroundColor"> & {
  color?: ColorBuilder;
  backgroundColor?: ColorBuilder;
}) {
  const cssProps = {
    ["--background-color"]: backgroundColor(),
    ["--color"]: color(),
    style,
  } as CSSProperties;

  return (
    <StyledUnreadBadge style={cssProps} {...rest}>
      {children}
    </StyledUnreadBadge>
  );
}

/**
 * We want to fade in on a delay when visible, for two reasons. First,
 * the fade is a nice effect. But second, if you're viewing the content that
 * would otherwise clear the badge, there might be a flicker as the badge
 * pops in (due to unread state from Firestore) then disappears (due to actions
 * of ClearUnreadView). The delay fixes that.
 */
const fadeIn = keyframes`
  from, 60% {
    opacity: 0;
  }
`;

export const StyledUnreadBadge = styled.div`
  box-sizing: border-box;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: ${fonts.displayBold({ size: 11, line: "1" })};
  color: var(--color);
  background: var(--background-color);
  padding: 0 4px 1px 4px;
  border-radius: 9999px;
  animation: ${fadeIn} 1s ${easing.outQuint};
`;
