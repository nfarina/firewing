import { X } from "lucide-react";
import { HTMLAttributes, MouseEvent, useState } from "react";
import { keyframes, styled } from "styled-components";
import { colors, shadows } from "../../colors/colors.js";
import { Button } from "../../components/Button.js";
import { fonts } from "../../fonts/fonts.js";
import { useGesture } from "../../hooks/useGesture.js";
import { useInterval } from "../../hooks/useInterval.js";
import { Link } from "../../router/Link.js";
import { easing } from "../../shared/easing.js";
import { Seconds } from "../../shared/timespan.js";
import { Toast } from "../context/ModalContext.js";

const AUTO_DISMISS_TIME = Seconds(4);

export function ToastView({
  title,
  message,
  icon,
  action,
  actionTo,
  actionTarget,
  actionReplace,
  ellipsize,
  to,
  target,
  dismissAfter,
  sticky,
  destructive,
  onClick,
  onClose,
  onActionClick,
  // Provided by <TransitionGroup>.
  in: animatingIn,
  onExited,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> &
  Omit<Toast, "key"> & {
    in?: boolean;
    onExited?: () => void;
  }) {
  // Allow swiping right on the toast to dismiss it.
  const onTouchStart = useGesture({
    direction: "right",
    onGestureComplete: onClose,
  });

  // If the toast isn't sticky, we'll close it when the timer fires, UNLESS
  // your mouse is hovering over the toast.
  const [hovering, setHovering] = useState(false);
  const [closeOnLeave, setCloseOnLeave] = useState(false);

  function onMouseEnter(e: MouseEvent<HTMLDivElement>) {
    setHovering(true);
  }

  function onMouseLeave(e: MouseEvent<HTMLDivElement>) {
    setHovering(false);
    if (closeOnLeave) {
      onClose?.();
    }
  }

  const requestClose = () => {
    if (sticky) return;
    if (hovering) {
      setCloseOnLeave(true);
    } else {
      onClose?.();
    }
  };

  // For automatically closing the toast.
  useInterval(requestClose, dismissAfter ?? AUTO_DISMISS_TIME, [sticky]);

  function onAnimationEnd() {
    if (animatingIn === false) {
      onExited?.();
    }
  }

  function handleActionClick(e: MouseEvent<HTMLElement>) {
    onActionClick?.(e);
    onClose?.();
  }

  function handleToastClick(e: MouseEvent<HTMLDivElement>) {
    // Make sure you didn't click a <button> like the close button or action button.
    if ((e.target as HTMLElement).closest("button")) return;

    if (onClick) {
      onClick();
      onClose?.();
    }
  }

  return (
    <StyledToastView
      {...rest}
      onTouchStart={onTouchStart}
      data-ellipsize={!!ellipsize}
      data-destructive={!!destructive}
      data-animating-in={animatingIn}
      data-clickable={!!onClick}
      onAnimationEnd={onAnimationEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleToastClick}
    >
      {/* These hover background are translucent so we need to paint them on top of the toast's natural opaque background. */}
      <div className="hover-bg" />
      {icon && <div className="icon">{icon}</div>}
      {to ? (
        <Link className="content" to={to} target={target}>
          {title && <div className="title">{title}</div>}
          {message && <div className="message">{message}</div>}
        </Link>
      ) : (
        <div className="content">
          {title && <div className="title">{title}</div>}
          {message && <div className="message">{message}</div>}
        </div>
      )}
      {!!action && (
        <Button
          newStyle
          bordered
          pill
          className="action"
          children={action}
          onClick={handleActionClick}
          destructive={destructive}
          to={actionTo}
          replace={actionReplace}
          target={actionTarget}
        />
      )}
      <Button
        className="close"
        newStyle
        destructive={destructive}
        onClick={onClose}
        icon={<X size={17} />}
      />
    </StyledToastView>
  );
}

const slideLeft = keyframes`
  from {
    transform: translateX(calc(100% + 40px));
  }
  /* For some reason we have to explicitly define the "to" state to make
     it work in Safari. Otherwise it just "appears" at the end of the
     animation. */
  to {
    transform: none;
  }
`;

const slideRight = keyframes`
  to {
    transform: translateX(calc(100% + 40px));
  }
`;

const StyledToastView = styled.div`
  min-height: 60px;
  background: ${colors.textBackground()};
  color: ${colors.text()};
  border-radius: 12px;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 5px;
  box-shadow:
    ${shadows.cardBorder()},
    0 4px 20px 0 ${colors.gray800({ alpha: 0.3 })};
  position: relative;

  @media (prefers-color-scheme: dark) {
    background: ${colors.gray750()};
    box-shadow:
      ${shadows.cardBorder()},
      0 4px 20px 0 ${colors.black({ alpha: 0.65 })},
      inset 0 0 0 1px ${colors.white({ alpha: 0.07 })};
  }

  &[data-animating-in="true"] {
    animation: ${slideLeft} 0.3s ${easing.outQuint};
  }

  &[data-animating-in="false"] {
    animation: ${slideRight} 0.3s ${easing.inOutCirc} forwards;
  }

  > * {
    flex-shrink: 0;
  }

  &[data-clickable="true"] {
    cursor: pointer;
  }

  > .hover-bg {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  > .icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-left: 13px;
    margin-right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
      width: 20px;
      height: 20px;
    }
  }

  > .content {
    flex-shrink: 1;
    flex-grow: 1;
    padding: 10px;
    padding-left: 13px;
    display: flex;
    flex-flow: column;
    color: ${colors.text()};
    text-decoration: none;

    > .title {
      font: ${fonts.displayBold({ size: 15, line: "24px" })};
      word-break: break-word;
    }

    > .message {
      font: ${fonts.display({ size: 15, line: "22px" })};
      word-break: break-word;
    }
  }

  &[data-ellipsize="true"] {
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

  > .action {
    min-height: 32px;
    padding: 0px 12px;
  }

  > .close {
    margin-right: 10px;
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    color: inherit;
  }

  &[data-clickable="true"] {
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        > .hover-bg {
          background: ${colors.buttonBackgroundHover()};
        }
      }
    }
  }

  &[data-destructive="true"] {
    color: ${colors.red({ darken: 0.2 })};

    @media (prefers-color-scheme: dark) {
      color: ${colors.red({ lighten: 0.15 })};
    }

    > .content > .title,
    > .content > .message {
      color: ${colors.red({ darken: 0.2, desaturate: 0.45 })};

      @media (prefers-color-scheme: dark) {
        color: ${colors.red({ lighten: 0.15, desaturate: 0.65 })};
      }
    }

    &[data-clickable="true"] {
      &:focus {
        > .hover-bg {
          background: ${colors.red({ alpha: 0.1 })};
        }
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          > .hover-bg {
            background: ${colors.red({ alpha: 0.1 })};
          }
        }
      }
    }
  }
`;
