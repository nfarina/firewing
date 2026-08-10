import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";

// Designed to hold a group of other form components like <Button>.
// Restyles them appropriately.

export function ButtonGroup({
  ...rest
}: {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return <StyledButtonGroup {...rest} />;
}

export const StyledButtonGroup = styled.div`
  display: flex;
  flex-flow: row;
  height: 30px;

  > * {
    flex-shrink: 0;
    /* Undo Button's min-height */
    min-height: unset;
  }

  > * {
    border-radius: 0;
  }

  > *:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  > *:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  > * + * {
    margin-left: -1px;
  }
`;
