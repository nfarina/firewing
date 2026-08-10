import { HTMLAttributes, ReactNode, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { Spinner, StyledSpinner } from "./Spinner.js";

export function BannerLayout({
  title = "Look at Banner, Michael!",
  visible,
  children,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  visible?: boolean;
  children?: ReactNode;
}) {
  // Need to track out own child ref for <CSSTransition> to not use the
  // deprecated `findDOMNode` API.
  const ref = useRef(null);

  return (
    <StyledBannerLayout {...rest}>
      <CSSTransition
        classNames="banner"
        nodeRef={ref}
        unmountOnExit
        in={visible}
        timeout={{
          enter: 300,
          exit: 300,
        }}
      >
        <div className="banner" ref={ref}>
          {title}
          {<Spinner smaller />}
        </div>
      </CSSTransition>
      {children}
    </StyledBannerLayout>
  );
}

export const StyledBannerLayout = styled.div`
  display: flex;
  flex-flow: column;
  overflow: hidden;
  position: relative;

  > .banner {
    z-index: 1;
    position: absolute;
    top: 0px;
    right: 0px;
    left: 0px;
    background: ${colors.textBackgroundPanel()};
    font: ${fonts.display({ size: 12 })};
    color: ${colors.textSecondary()};
    padding: 5px 10px;
    border-bottom: 1px solid ${colors.separator()};
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;

    > ${StyledSpinner} {
      margin-left: 5px;
    }
  }

  > .banner-enter {
    transform: translateY(-100%);
  }

  > .banner-enter-active {
    transform: translateY(0);
    transition: transform 0.3s ease-in-out;
  }

  > .banner-exit {
    transform: translateY(0);
  }

  > .banner-exit-active {
    transform: translateY(-100%);
    transition: transform 0.3s ease-in-out;
  }

  > * {
    width: 0;
    min-width: 100%;
    flex-grow: 1;
    z-index: 0;
  }
`;
