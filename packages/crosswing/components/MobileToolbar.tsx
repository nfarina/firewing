import { ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { safeArea } from "../safearea/safeArea.js";
import { Clickable } from "./Clickable.js";

export const MobileToolbarLayout = styled.div`
  display: flex;
  flex-flow: column;

  > *:nth-child(1) {
    flex-shrink: 0;
    flex-grow: 1;
    height: 0;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
  }
`;

export function MobileToolbar({ children }: { children?: ReactNode }) {
  return <StyledMobileToolbar children={children} />;
}

export const MobileToolbarButton = styled(Clickable)`
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text()};
`;
export const MobileToolbarSpace = styled.div``;

export const StyledMobileToolbar = styled.div`
  height: 44px;
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.1);
  background: ${colors.textBackground()};
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: ${safeArea.top()};
  padding-left: ${safeArea.left()};
  padding-right: ${safeArea.right()};

  > * {
    flex-shrink: 0;
  }

  > ${MobileToolbarSpace} {
    flex-grow: 1;
  }
`;
