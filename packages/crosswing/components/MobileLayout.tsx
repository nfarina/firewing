import { ReactElement } from "react";
import { styled } from "styled-components";

/**
 * Renders content designed for phones only in a way that is tolerable on
 * larger screens when needed.
 */
export function MobileLayout({ children }: { children?: ReactElement<any> }) {
  return <StyledMobileLayout children={children} />;
}

export const StyledMobileLayout = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;

  > * {
    flex-grow: 1;
    box-sizing: border-box;
    width: 100%;
    max-width: 500px;
  }
`;
