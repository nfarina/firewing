import { HTMLAttributes } from "react";
import { keyframes, styled } from "styled-components";
import { colors } from "../colors/colors.js";

export function Spinner({
  hidden,
  white,
  smaller,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  hidden?: boolean;
  white?: boolean;
  smaller?: boolean;
}) {
  if (hidden) {
    return null; // don't render anything!
  }

  return (
    <StyledSpinner {...rest} data-white-style={!!white} data-smaller={smaller}>
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </StyledSpinner>
  );
}

// Animation that "inflates" the bubbles.
const bubbleUp = keyframes`
  0%, 80%, 100% {
    transform: scale(0.0);
  } 40% {
    transform: scale(1.0);
  }
`;

export const StyledSpinner = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  width: calc(14px * 3 + 3px * 2);
  height: 14px;
  font-size: 0;

  > .dot {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    background: ${colors.mediumGray()};

    border-radius: 100%;
    display: inline-block;
    animation: ${bubbleUp} 1.4s infinite ease-in-out;
    /* Prevent first frame from flickering when animation starts */
    animation-fill-mode: both;
  }

  &[data-white-style="true"] {
    > .dot {
      background: ${colors.white()};
    }
  }

  > .dot + .dot {
    margin-left: 3px;
  }

  > .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  > .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  &[data-smaller="true"] {
    width: calc((14px * 3 + 3px * 2) / 2);
    height: calc(14px / 2);

    > .dot {
      width: calc(14px / 2);
      height: calc(14px / 2);
    }

    > .dot + .dot {
      margin-left: 1.5px;
    }
  }
`;
