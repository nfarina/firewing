import { ReactNode, useRef } from "react";
import { keyframes, styled } from "styled-components";
import { useHotKey } from "../../hooks/useHotKey.js";
import { useInterval } from "../../hooks/useInterval.js";
import { safeArea } from "../../safearea/safeArea.js";
import { Seconds } from "../../shared/timespan.js";
import { Modal, useModal } from "../context/useModal.js";
import { BannerView } from "./BannerView.js";

export * from "./BannerView.js";

const AUTO_DISMISS_TIME = Seconds(3.5);

export interface Banner {
  title?: ReactNode;
  message?: ReactNode;
  wrap?: boolean;
  sticky?: boolean;
  to?: string;
  onClick?: () => void;
}

export function useBanner<T extends any[]>(
  renderBanner: (...args: T) => Banner | string,
): Modal<T> {
  const modal = useModal((...args: T) => {
    const bannerOrString = renderBanner(...args);
    const banner =
      typeof bannerOrString === "string" ? { message: bannerOrString, wrap: true } : bannerOrString;

    return <BannerContainer onClose={modal.hide} banner={banner} />;
  });

  return modal;
}

export const BannerContainer = ({
  banner,
  onClose,
  // Provided by <TransitionGroup>.
  in: animatingIn,
  onExited,
}: {
  banner: Banner;
  onClose: () => void;
  in?: boolean;
  onExited?: () => void;
}) => {
  const { title, message, wrap, sticky, to, onClick } = banner;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Listen for the escape key and call onClose if pressed.
  useHotKey("Escape", { target: containerRef }, onClose);

  // For automatically closing the bubble.
  useInterval(
    () => {
      if (!sticky) onClose();
    },
    AUTO_DISMISS_TIME,
    [sticky],
  );

  function onAnimationEnd() {
    if (animatingIn === false) {
      onExited?.();
    }
  }

  function onBannerClick() {
    onClick?.();
    onClose();
  }

  return (
    <StyledBannerContainer
      ref={containerRef}
      data-animating-in={animatingIn}
      onAnimationEnd={onAnimationEnd}
    >
      <BannerView
        title={title}
        message={message}
        wrap={wrap}
        to={to}
        onClick={onBannerClick}
        onClose={onClose}
      />
    </StyledBannerContainer>
  );
};

const slideDown = keyframes`
  from {
    transform: translateY(-200px);
  }
  /* For some reason we have to explicitly define the "to" state to make
     it work in Safari. Otherwise it just "appears" at the end of the
     animation. */
  to {
    transform: none;
  }
`;

const slideUp = keyframes`
  to {
    transform: translateY(-200px);
  }
`;

const StyledBannerContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: calc(10px + ${safeArea.top()});
  padding-right: calc(10px + ${safeArea.right()});
  padding-bottom: calc(10px + ${safeArea.bottom()});
  padding-left: calc(10px + ${safeArea.left()});
  pointer-events: none;

  > * {
    width: 100%;
    max-width: 600px;
    pointer-events: auto;
  }

  &[data-animating-in="true"] {
    > * {
      animation: ${slideDown} 0.5s linear;
    }
  }

  &[data-animating-in="false"] {
    > * {
      animation: ${slideUp} 0.5s linear forwards;
    }
  }
`;
