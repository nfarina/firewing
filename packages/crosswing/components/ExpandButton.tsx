import { ButtonHTMLAttributes, CSSProperties } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { Clickable } from "./Clickable.js";
import { ChevronRight } from "lucide-react";

export function ExpandButton({
  rotate = 0,
  style,
  transparent,
  as,
  ...rest
}: {
  rotate?: number;
  transparent?: boolean;
  as?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cssProps = {
    "--rotate": rotate + "deg",
    ...style,
  } as CSSProperties;

  return (
    <StyledExpandButton style={cssProps} {...rest} as={as}>
      <div className="circle" data-transparent={!!transparent}>
        <ChevronRight />
      </div>
    </StyledExpandButton>
  );
}

export const StyledExpandButton = styled(Clickable)`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  > .circle {
    width: 30px;
    height: 30px;
    background: ${colors.lightGray()};
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    transform: rotate(calc(-90deg + var(--rotate)));

    @media (prefers-color-scheme: dark) {
      background: ${colors.extraExtraExtraDarkGray()};
    }

    &[data-transparent="true"] {
      background: transparent;
    }

    > svg {
      color: ${colors.text()};
    }
  }
`;
