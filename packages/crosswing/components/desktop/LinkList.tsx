import {
  cloneElement,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  use,
  useEffect,
  useRef,
} from "react";
import { styled } from "styled-components";
import { RouterContext } from "../../router/context/RouterContext.js";
import { SeparatorEdges, SeparatorLayout, StyledSeparatorLayout } from "../SeparatorLayout.js";
import { LinkListCell } from "./LinkListCell.js";
import { LinkListHeading, StyledLinkListHeading } from "./LinkListHeading.js";

export function LinkList<T extends { id: string }>({
  items = [],
  renderItem,
  renderHeading,
  after,
  onScroll,
  /** True if this list should be a natural height instead of just filling up its container. */
  autoSize,
  edges = "bottom",
  ...rest
}: {
  items?: T[];
  renderItem?: (item: T) => ReactElement<any>;
  renderHeading?: (group: string) => ReactElement<any>;
  after?: ReactNode;
  autoSize?: boolean;
  edges?: SeparatorEdges;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  // const [scrolledToActive, setScrolledToActive] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { location } = use(RouterContext);

  // Get the next path component after our current location, if any.
  // This will be the ID of the item that's currently selected.
  const currentId = location.segments[location.claimIndex];
  // const selectedItem = items.find(({ id }) => id === currentId);

  useEffect(() => {
    // Do an initial scroll of the list to the selected item, if any.
    listRef.current?.querySelector(`[data-id="${currentId}"]`)?.scrollIntoView();
  }, []);

  function renderItemWithProps(item: T) {
    const rendered = renderItem?.(item) ?? <LinkListCell title={item.id} />;

    return cloneElement(rendered, {
      ...(!rendered.key ? { key: item.id } : null),
      ...(!rendered.props.to ? { to: item.id } : null),
      "data-id": item.id,
    });
  }

  function renderHeadingWithProps(group: string) {
    const rendered = renderHeading?.(group) ?? <LinkListHeading children={group} />;

    return cloneElement(rendered, {
      ...(!rendered.key ? { key: group } : null),
      "data-group": group,
    });
  }

  const renderItems = () => {
    const renderedItems: ReactNode[] = [];

    let lastGroup = "";

    for (const item of items) {
      const rendered = renderItemWithProps(item);

      const group = rendered.props.group ?? "";

      if (group !== lastGroup) {
        renderedItems.push(renderHeadingWithProps(group));
      }

      renderedItems.push(rendered);
      lastGroup = group;
    }

    return renderedItems;
  };

  return (
    <StyledLinkList ref={listRef} data-auto-size={!!autoSize} {...rest}>
      <SeparatorLayout onScroll={onScroll} edges={edges}>
        {renderItems()}
        {!!after && after}
      </SeparatorLayout>
    </StyledLinkList>
  );
}

export const StyledLinkList = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;

  > ${StyledSeparatorLayout} {
    height: 0;
    flex-grow: 1;
    overflow-y: auto;

    /* Leave enough space for the support button. */
    /* padding-bottom: {supportArea({ alwaysPad: true }).bottom}; */

    /* Forgot we don't have access to our proprietary consuming app! */
    padding-bottom: 85px;

    > * {
      z-index: 1;
    }

    > ${StyledLinkListHeading} {
      position: sticky;
      inset-block-start: 0; /* "top" */
      z-index: 2;
    }
  }

  &[data-auto-size="true"] {
    > ${StyledSeparatorLayout} {
      height: auto;
      flex-grow: 0;
    }
  }
`;
