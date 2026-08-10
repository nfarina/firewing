import { HTMLAttributes, ReactElement, useLayoutEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { StyledToolbar } from "./Toolbar.js";
import { ToolbarContext, ToolbarContextValue, ToolbarInsertionRef } from "./ToolbarContext.js";

export function ToolbarLayout({
  children,
  className = "",
  hideSeparator = false,
  hidesParentToolbars = false,
  neverHides,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children: [ReactElement, ReactElement];
  /** Pass true to hide the hairline shadow under the toolbar. */
  hideSeparator?: boolean;
  hidesParentToolbars?: boolean;
  neverHides?: boolean;
}) {
  const divRef = useRef<HTMLDivElement | null>(null);

  const [insertionRefs, setInsertionRefs] = useState<Record<string | symbol, ToolbarInsertionRef>>(
    {},
  );

  const [, setForceRender] = useState(0);

  useLayoutEffect(() => {
    if (neverHides) return;

    const thisLayout = divRef.current;
    if (!thisLayout) return;

    // Search the document for all ToolbarLayouts.
    const toolbarLayouts = document.querySelectorAll(".toolbar-layout");
    for (const toolbarLayout of Array.from(toolbarLayouts)) {
      if (toolbarLayout === thisLayout) continue; // Ignore ourself.

      if (thisLayout.contains(toolbarLayout)) {
        // We have a <ToolbarLayout> as a descendant.
        thisLayout.dataset.hasToolbarLayoutDescendent = "true";
        return;
      }
    }

    thisLayout.dataset.hasToolbarLayoutDescendent = "false";
  });

  // If you want us to hide other ancestor toolbars when we are in the
  // component tree (only on mobile-sized viewports) then we'll need
  // to use a special marker class.
  const defaultClass = hidesParentToolbars ? "toolbar-layout" : "";

  function getInsertionRef(name: string | symbol): ToolbarInsertionRef {
    const ref = insertionRefs[name];
    if (!ref) return { current: null };
    return ref;
  }

  function setInsertionRef(name: string | symbol, ref: ToolbarInsertionRef) {
    setInsertionRefs((refs) => ({ ...refs, [name]: ref }));
    setForceRender((n) => n + 1);
  }

  const context: ToolbarContextValue = {
    isDefaultContext: false,
    getInsertionRef,
    setInsertionRef,
  };

  const [toolbar, content] = children;

  return (
    <StyledToolbarLayout
      ref={divRef}
      className={defaultClass + " " + className}
      data-hide-separator={hideSeparator}
      {...rest}
    >
      <ToolbarContext value={context}>
        {toolbar}
        <div className="content">{content}</div>
      </ToolbarContext>
    </StyledToolbarLayout>
  );
}

export const StyledToolbarLayout = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;

  > ${StyledToolbar} {
    flex-shrink: 0;
    z-index: 1;
    /* Prevents width overscroll when toolbar overflows. */
    width: 0;
    min-width: 100%;
  }

  /* Separator */
  &[data-hide-separator="false"] > ${StyledToolbar} {
    box-shadow: 0 1px 0 ${colors.separator()};
  }

  /* Content */
  > .content {
    height: 0;
    flex-grow: 1;
    z-index: 0;
    display: flex;
    flex-flow: column;

    > * {
      width: 0;
      min-width: 100%;
      height: 0;
      flex-grow: 1;
    }
  }

  /* Mobile layout */
  @media (max-width: 950px) {
    &[data-has-toolbar-layout-descendent="true"] > ${StyledToolbar} {
      display: none;
    }
  }
`;
