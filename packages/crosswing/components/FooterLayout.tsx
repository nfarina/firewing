import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { safeArea } from "../safearea/safeArea.js";
import { MobileLayout, StyledMobileLayout } from "./MobileLayout.js";
import { Scrollable, StyledScrollable } from "./Scrollable.js";

/**
 * A common mobile layout with scrollable content and a fixed footer, usually
 * containing a large button, and accounting for any bottom safe area.
 */
export function FooterLayout({
  children,
  footer,
  ...rest
}: {
  footer?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <StyledFooterLayout {...rest}>
      <Scrollable>
        <MobileLayout>
          <div className="content" data-has-children={!!children}>
            <div className="children">{children}</div>
          </div>
        </MobileLayout>
      </Scrollable>
      {footer && (
        <MobileLayout>
          <div className="footer" children={footer} />
        </MobileLayout>
      )}
    </StyledFooterLayout>
  );
}

export const StyledFooterLayout = styled.div`
  display: flex;
  flex-flow: column;
  padding-bottom: ${safeArea.bottom()};
  position: relative;

  > ${StyledScrollable} {
    height: 0;
    flex-grow: 1;
    flex-shrink: 0;
    z-index: 0;

    > ${StyledMobileLayout} {
      > .content {
        display: flex;
        flex-flow: column;

        > .children {
          display: flex;

          > * {
            flex-grow: 1;
          }
        }
      }
    }
  }

  > ${StyledMobileLayout} {
    > .footer {
      flex-shrink: 0;
      padding: 10px;
      display: flex;
      flex-flow: column;
      border-top: 1px solid ${colors.separator()};
      z-index: 1;

      > * {
        flex-shrink: 1;
      }
    }
  }
`;
