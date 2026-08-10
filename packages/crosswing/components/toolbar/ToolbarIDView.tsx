import { HTMLAttributes, useRef } from "react";
import { styled } from "styled-components";
import { useElementSize } from "../../hooks/useElementSize.js";
import { IDView } from "../IDView.js";

export function ToolbarIDView({
  name,
  id,
  truncate,
  ...rest
}: HTMLAttributes<HTMLDivElement> &
  Pick<Parameters<typeof IDView>[0], "name" | "id" | "truncate">) {
  const ref = useRef<HTMLDivElement | null>(null);

  useElementSize(ref, (size) => {
    const el = ref.current?.children[0] as HTMLElement | undefined;
    if (!el) return;

    if (size.width < el.clientWidth) {
      el.style.opacity = "0";
    } else {
      el.style.opacity = "1";
    }

    // Now that we've set the initial opacity, we can add a transition for future
    // changes.
    el.style.transition = "opacity 0.1s ease-in-out";
  });

  return (
    <StyledToolbarIDView ref={ref} {...rest}>
      <IDView name={name} id={id} truncate={truncate} />
    </StyledToolbarIDView>
  );
}

export const StyledToolbarIDView = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  min-width: 16px;
  overflow: hidden;
`;
