import { X } from "lucide-react";
import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors, shadows } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useGesture } from "../../hooks/useGesture.js";
import { Link } from "../../router/Link.js";

export function BannerView({
  title,
  message,
  wrap,
  to,
  onClick,
  onClose,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  message?: ReactNode;
  wrap?: boolean;
  to?: string;
  onClick?: () => void;
  onClose?: () => void;
}) {
  // Allow swiping up on the banner to dismiss it.
  const onTouchStart = useGesture({
    direction: "up",
    onGestureComplete: onClose,
  });

  return (
    <StyledBannerView {...rest} onTouchStart={onTouchStart} data-wrap-text={!!wrap}>
      {to ? (
        <Link className="content" to={to} onClick={() => onClick?.()}>
          <div className="title">{title}</div>
          <div className="message">{message}</div>
        </Link>
      ) : (
        <div className="content" onClick={() => onClick?.()}>
          <div className="title">{title}</div>
          <div className="message">{message}</div>
        </div>
      )}
      <div className="close" onClick={onClose}>
        <X />
      </div>
    </StyledBannerView>
  );
}

const StyledBannerView = styled.div`
  min-height: 60px;
  background: ${colors.textBackground()};
  color: ${colors.text()};
  border-radius: 7px;
  box-shadow:
    ${shadows.cardBorder()},
    0 4px 20px 0 ${colors.darkGreen({ alpha: 0.3 })};

  @media (prefers-color-scheme: dark) {
    box-shadow:
      ${shadows.cardBorder()},
      0 4px 20px 0 ${colors.black({ alpha: 0.3 })};
  }

  display: flex;
  flex-flow: row;
  align-items: center;

  > .content {
    flex-grow: 1;
    padding: 10px;
    display: flex;
    flex-flow: column;
    cursor: pointer;
    color: ${colors.text()};
    text-decoration: none;

    > .title {
      font: ${fonts.displayBold({ size: 15, line: "22px" })};
    }

    > .message {
      font: ${fonts.display({ size: 15, line: "22px" })};
    }
  }

  &[data-wrap-text="false"] {
    > .content {
      > .title,
      > .message {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 0;
        min-width: 100%;
      }
    }
  }

  > .close {
    width: 44px;
    flex-shrink: 0;
    align-self: stretch;

    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${colors.text()};

    > svg {
      width: 18px;
      height: 18px;
    }
  }
`;
