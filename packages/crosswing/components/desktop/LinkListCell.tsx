import { Check, X } from "lucide-react";
import { ReactNode, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { RouterContext } from "../../router/context/RouterContext.js";
import { Link } from "../../router/Link.js";
import { formatCurrency } from "../../shared/numeric.js";

/**
 * A versatile way to display list items on the desktop.
 */
export function LinkListCell({
  to,
  label,
  title,
  subtitle,
  amount,
  detail,
  badge,
  left,
  right,
  group,
  preserveTab = true,
  children,
  ...rest
}: Omit<Parameters<typeof Link>[0], "title"> & {
  label?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  amount?: ReactNode;
  detail?: ReactNode;
  badge?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  group?: string | null;
  preserveTab?: boolean;
  children?: ReactNode;
}) {
  const { location } = use(RouterContext);

  // Preserve the "tab" that you were on (like Devices/Support/Details).
  // If we are rendering at the "/users" point of the path, then the full path
  // is "/users/123/devices", then the "unclaimed" portion will be
  // "123/devices".
  const tab = !!preserveTab && location.unclaimedPath().split("/")[1];

  const link = to ?? "";
  const resolvedTo = location.linkTo(tab ? link + "/" + tab : link);
  // const isActive = (location.href() + "/").startsWith(to + "/");

  return (
    <StyledLinkListCell to={resolvedTo} {...rest}>
      {left && <div className="left">{left}</div>}
      <div className="content">
        {label && <span className="label">{label}</span>}
        {title && <div className="title">{title}</div>}
        {subtitle && <div className="subtitle">{subtitle}</div>}
        {(amount || amount === 0) && (
          <div className="amount">
            {typeof amount === "number" ? formatCurrency(amount) : amount}
          </div>
        )}
        {badge && <div className="badge">{badge}</div>}
        {detail && <div className="detail">{detail}</div>}
        {children && <div className="children">{children}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </StyledLinkListCell>
  );
}

/** A component you can drop in to LinkListCell.right. */
export const LinkListIconFailed = styled.div.attrs({
  children: <X />,
})`
  font-size: 0;
  border-radius: 100%;
  width: 24px;
  height: 24px;
  color: ${colors.red({ darken: 0.2, saturate: 1 })};
  background: ${colors.red({ lighten: 0.2 })};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (prefers-color-scheme: dark) {
    background: ${colors.red({ darken: 0.4, desaturate: 0.2 })};
    color: ${colors.red()};
  }

  > svg {
    width: 18px;
    height: 18px;
  }
`;

/** A component you can drop in to LinkListCell.right. */
export const LinkListIconSucceeded = styled.div.attrs({
  children: <Check />,
})`
  font-size: 0;
  border-radius: 100%;
  width: 24px;
  height: 24px;
  background: ${colors.turquoise({ lighten: 0.3, desaturate: 0.5 })};
  color: ${colors.turquoise()};

  > svg {
    transform: scale(0.62);
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.darkGreen()};
    color: ${colors.turquoise()};
  }
`;

/** A component you can drop in to LinkListCell.badge. */
export const LinkListCellBadge = styled.div`
  align-self: flex-start;
  box-sizing: border-box;
  color: ${colors.textBackground()};
  font: ${fonts.displayBold({ size: 12 })};
  border-radius: 3px;
  background: ${colors.mediumGray()};
  padding: 2px 5px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledLinkListCell = styled(Link)`
  display: flex;
  flex-flow: row;
  align-items: center;

  /* Reset typical <a> styles. */
  text-decoration: none;
  color: ${colors.text()};

  > .left {
    flex-shrink: 0;
    margin: 10px;
    display: flex;
    flex-flow: row;
    align-items: center;

    > * {
      flex-shrink: 0;
    }
  }

  > .content {
    width: 0;
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    margin: 10px;

    > * + * {
      margin-top: 5px;
    }

    > .label {
      font: ${fonts.displayBold({ size: 15 })};
      color: ${colors.text()};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .title {
      font: ${fonts.display({ size: 15 })};
      color: ${colors.text()};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .amount {
      font: ${fonts.numericBlack({ size: 15 })};
      color: ${colors.text()};
      letter-spacing: 0.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .subtitle {
      font: ${fonts.display({ size: 13 })};
      color: ${colors.text()};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .badge {
      display: flex;
      flex-flow: row;

      > ${LinkListCellBadge} + ${LinkListCellBadge} {
        margin-left: 5px;
      }
    }

    > .detail {
      font: ${fonts.display({ size: 13 })};
      color: ${colors.textSecondary()};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .children {
      display: flex;
      flex-flow: column;

      > * {
        flex-grow: 1;
      }
    }
  }

  > .left + .content {
    margin-left: 0;
  }

  > .right {
    flex-shrink: 0;
    margin: 10px;
    display: flex;
    flex-flow: row;
    align-items: center;

    > * {
      flex-shrink: 0;
    }
  }

  > .content + .right {
    margin-left: 0;
  }

  &[data-prefix-active="true"] {
    background: #e9f7fb;

    @media (prefers-color-scheme: dark) {
      background: #174a56;

      /* Make this icon more visible in dark mode when selected. */
      > .right > ${LinkListIconSucceeded} {
        box-shadow: 0 0 0 1px ${colors.separator()};
      }
    }
  }
`;
