import { Check, ChevronRight } from "lucide-react";
import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Link } from "../../router/Link.js";
import { Clickable } from "../Clickable.js";

/**
 * A versatile way to display data in a form setting.
 */
export function TextCell({
  left,
  icon,
  label,
  action,
  title,
  subtitle,
  detail,
  children,
  badge,
  right,
  checked,
  hideDisclosure,
  ellipsize,
  disabled,
  newStyle,
  ...rest
}: Omit<
  HTMLAttributes<HTMLDivElement> | Parameters<typeof Clickable>[0] | Parameters<typeof Link>[0],
  "title"
> & {
  /** If provided, the cell will be rendered as a `Link` to the given URL. */
  to?: string;
  /** If `to` is provided, this will be passed to the `Link` component. */
  target?: string;
  /** Typically an image thumbnail. */
  left?: ReactNode;
  /** Icon formatted to align with title. */
  icon?: ReactNode;
  /** Uppercased and placed above the title. */
  label?: ReactNode;
  /** Same color as title, but smaller and bolded. */
  action?: ReactNode;
  /** The main title of the cell. */
  title?: ReactNode;
  /** Same color as title. */
  subtitle?: ReactNode;
  /** Secondary color, for less-important information. */
  detail?: ReactNode;
  /** For arbitrary content, placed below the text. */
  children?: ReactNode;
  /** Badge area to the right of the title, useful for action buttons also. */
  badge?: ReactNode;
  /** On the right edge of the cell, left of the disclosure arrow (if present). */
  right?: ReactNode;
  /** A checkmark to the right of the title. */
  checked?: boolean;
  /** If true, the disclosure arrow will not be shown. Useful for a toggle. */
  hideDisclosure?: boolean;
  /** If true, the text will be ellipsized. */
  ellipsize?: boolean;
  /** If true, the cell will be disabled and set to opacity 0.5. */
  disabled?: boolean;
  /** Modern UI style. */
  newStyle?: boolean;
}) {
  const isClickable = !!rest.to || !!rest.onClick;
  const showDisclosure = isClickable && !hideDisclosure && checked == null;

  return (
    <StyledTextCell
      as={rest.to ? Link : rest.onClick ? Clickable : "div"}
      {...rest}
      // Pass type=button to disable auto form submit.
      {...(rest.onClick ? { disabled: !!disabled, type: "button" } : null)}
      data-clickable={isClickable} // For our own use, and for session tracking.
      data-ellipsize={!!ellipsize}
      data-disabled={!!disabled} // An additional prop in case we're not as=button.
      data-new-style={!!newStyle}
      data-show-disclosure={showDisclosure}
    >
      {left && <div className="left">{left}</div>}
      {icon && <div className="icon" children={icon} />}
      <div className="content">
        {label && <span className="label">{label}</span>}
        {action && <div className="action">{action}</div>}
        {title && <div className="title">{title}</div>}
        {subtitle && <div className="subtitle">{subtitle}</div>}
        {detail && <div className="detail">{detail}</div>}
        {children && <div className="children">{children}</div>}
      </div>
      {badge && <div className="badge">{badge}</div>}
      {right && <div className="right">{right}</div>}
      {checked != null && (
        <div className="checked">{checked ? <Check /> : <div className="not-checked" />}</div>
      )}
      {showDisclosure && <ChevronRight size={20} className="disclosure" />}
    </StyledTextCell>
  );
}

export const StyledTextCell = styled.div`
  display: flex;
  flex-flow: row;
  min-height: 60px;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  color: ${colors.text()};
  text-decoration: none;
  gap: 10px;

  /* Re-enable text selection in a mobile setting. */
  user-select: text;

  > .left {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  > .icon {
    /* A little negative right margin helps with our icons. */
    margin: 0 -3px 0 0;
    display: flex;

    > svg {
      width: 20px;
      height: 20px;
    }
  }

  > .content {
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    margin: 10px 0;

    > .label {
      font: ${fonts.displayBold({ size: 11, line: "16px" })};
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: -2px 0 5px 0;
      word-break: break-word;
    }

    > .action {
      font: ${fonts.displayBold({ size: 14, line: "20px" })};
      word-break: break-word;
    }

    > .title {
      font: ${fonts.display({ size: 15, line: "21px" })};
      word-break: break-word;
    }

    > .subtitle {
      font: ${fonts.display({ size: 13, line: "18px" })};
      word-break: break-word;
    }

    > .detail {
      font: ${fonts.display({ size: 13, line: "18px" })};
      word-break: break-word;
      color: ${colors.textSecondary()};
    }

    > .children {
      display: flex;
      flex-flow: column;

      > * {
        flex-grow: 1;
      }
    }
  }

  > .badge {
    flex-shrink: 0;
    display: flex;
    flex-flow: row;
    align-items: center;
  }

  > .right {
    flex-shrink: 0;
    display: flex;
    flex-flow: row;
    align-items: center;
  }

  > .checked {
    flex-shrink: 0;
    width: 22px;
    height: 22px;

    > svg {
      width: 100%;
      height: 100%;
    }
  }

  > .disclosure {
    /* The icon artwork is narrow, so we'll pull in the margins a bit. */
    margin: 0 -2px;
    flex-shrink: 0;
    color: ${colors.textSecondary()};
  }

  &[data-new-style="true"] {
    border-radius: 9px;
    /* padding-left: 0; */

    > .content {
      > .title {
        font: ${fonts.display({ size: 14, line: "20px" })};
      }

      > .subtitle {
        font: ${fonts.display({ size: 12, line: "16px" })};
      }

      > .detail {
        font: ${fonts.display({ size: 12, line: "16px" })};
      }
    }
  }

  &[data-show-disclosure="false"] {
  }

  &[data-ellipsize="true"] {
    > .content {
      > .label,
      > .action,
      > .title,
      > .subtitle,
      > .detail {
        width: 0;
        min-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  &[data-clickable="true"] {
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: ${colors.buttonBackgroundHover()};
      }
    }
  }

  &:disabled,
  &[data-disabled="true"] {
    opacity: unset; /* Override Clickable's disabled state so we don't fade out the background. */
    cursor: default;

    > .content {
      > .label,
      > .action,
      > .subtitle,
      > .children,
      > .title {
        opacity: 0.5;
      }

      > .detail {
        /* Half opacity makes it totally unreadable. */
        opacity: 0.75;
      }
    }

    > .disclosure {
      opacity: 0.5;
    }
  }
`;
