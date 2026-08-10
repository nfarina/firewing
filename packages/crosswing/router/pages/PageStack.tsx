import { Activity, isValidElement, ReactElement, ReactNode } from "react";
import { styled } from "styled-components";
import { flattenChildren } from "../../hooks/flattenChildren";

/**
 * PageStack provides a simple "drill-down" navigation stack for programmatic
 * rendering of multiple pages where you want to show one at a time, but
 * preserve pages "above" the current page in the stack in memory for scroll
 * state and quick navigation. It's similar to Navs, but much lighter weight
 * since the construction of the stack is left to the caller. Each page gets
 * its own Activity to preserve it in memory. Only the last page in the stack
 * will be visible.
 */
export function PageStack({ children }: { children?: ReactNode }) {
  const pages = flattenChildren(children).filter(isPageComponent);

  return (
    <StyledPageStack>
      {pages.map((page, index) => (
        <Activity
          key={page.key}
          mode={index === pages.length - 1 ? "visible" : "hidden"}
          children={page}
        />
      ))}
    </StyledPageStack>
  );
}

function isPageComponent(child: ReactNode): child is ReactElement {
  return isValidElement(child);
}

export const StyledPageStack = styled.div`
  display: flex;
  flex-flow: column;

  > * {
    height: 0;
    flex-grow: 1;
  }

  > *:not(:last-child) {
    display: none;
  }
`;
