import { use, useEffect, useState } from "react";
import { ModalContext } from "../context/ModalContext";

export type Tooltip = {
  id: string;
  props: { ["data-tooltip-id"]: string };
};

let nextTooltipId = 1;
function getNextTooltipId() {
  return String(nextTooltipId++);
}

/**
 * Creates an updatable "rich" tooltip that can contain arbitrary React nodes.
 *
 * @param render - A function that returns the React node to display as the
 *   tooltip. `TooltipView` is a good base component to use.
 * @returns The props to spread onto the target element (just `data-tooltip-id`).
 */
export function useTooltip(render: (target: Element) => React.ReactNode): Tooltip {
  const { setTooltip } = use(ModalContext);
  const [id] = useState(() => getNextTooltipId());

  useEffect(() => {
    setTooltip(id, render);

    return () => {
      setTooltip(id, null);
    };
  }, [id, render, setTooltip]);

  return { id, props: { "data-tooltip-id": id } };
}
