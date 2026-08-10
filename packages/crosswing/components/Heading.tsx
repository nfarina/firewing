import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors, HexColorBuilder } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { Button } from "./Button.js";
import { Badge, StyledBadge } from "./badges/Badge.js";

export function Heading({
  children,
  subtitle,
  right,
  onClick,
  smaller = false,
  badgeText,
  badgeTint,
  disabled = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  smaller?: boolean;
  /** Optional badge directly following the title. */
  badgeText?: string;
  /** Optional tint for the badge. */
  badgeTint?: HexColorBuilder;
  /** Fades out the text similar to labeled text inputs, and disables the click handler. */
  disabled?: boolean;
}) {
  return (
    <StyledHeading
      data-clickable={!!onClick}
      data-smaller={smaller}
      data-disabled={disabled}
      {...rest}
    >
      {(!!children || !!subtitle) && (
        <div className="content">
          {children && (
            <div className="title" onClick={onClick}>
              {children}
              {badgeText && <Badge children={badgeText} tint={badgeTint} small={smaller} />}
            </div>
          )}
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
      )}
      {right && <div className="right">{right}</div>}
    </StyledHeading>
  );
}

export const HeadingButton = styled(Button)`
  /* Make it a "pill" shape. */
  border-radius: 9999px;
  padding: 6px 15px;
  min-height: 24px;
  font: ${fonts.displayBold({ size: 14, line: "1" })};
`;

export const StyledHeading = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  color: ${colors.text()};

  > .content {
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    gap: 6px;

    > * {
      flex-shrink: 0;
    }

    > .title {
      font: ${fonts.displayBold({ size: 19, line: "26px" })};

      > ${StyledBadge} {
        margin-left: 10px;
        transform: translateY(-2px);
      }
    }

    > .subtitle {
      font: ${fonts.display({ size: 14, line: "20px" })};
    }
  }

  &[data-clickable="true"] {
    > .content {
      cursor: pointer;
    }
  }

  &[data-smaller="true"] {
    > .content {
      > .title {
        font: ${fonts.displayMedium({ size: 14, line: "20px" })};

        > ${StyledBadge} {
          margin-left: 7px;
          transform: translateY(0);
        }
      }
    }
  }

  &[data-disabled="true"] {
    > .content {
      pointer-events: none;

      > .title {
        color: ${colors.text({ alpha: 0.5 })};

        > ${StyledBadge} {
          opacity: 0.5;
        }
      }
    }
  }

  > .right {
    flex-shrink: 0;
  }
`;
