import {
  isValidElement,
  MouseEvent,
  ReactElement,
  ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { usePopup } from "../../modals/popup/usePopup.js";
import { RouterContext } from "../../router/context/RouterContext.js";
import { PopupMenu, PopupMenuText } from "../PopupMenu.js";
import {
  StyledToolbarTabButton,
  StyledToolbarTabLink,
  ToolbarTab,
  ToolbarTabProps,
} from "./ToolbarTab.js";

/**
 * Like a <ToolbarTab> but with a built-in "overflow" menu to contain the actual
 * <ToolbarTab> links.
 */
export function ToolbarOverflowTab({ children }: { children: ReactNode }) {
  const { location } = use(RouterContext);

  const [lastTab, setLastTab] = useState<ReactElement<ToolbarTabProps> | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  // Coerce children to array, flattening fragments and falsy conditionals.
  const items = flattenChildren(children);

  // Just the <ToolbarTab> children.
  const tabs = items.filter(isToolbarTab);

  // Popup that appears when clicking the disclosure arrow.
  // Transforms <ToolbarTab> children into <PopupMenuText> children.
  // Renders the rest unmodified.
  const popup = usePopup(() => (
    <PopupMenu>
      {items.map((item) =>
        isToolbarTab(item) ? (
          <StyledPopupMenuTab
            key={item.props.to}
            to={location.linkTo(item.props.to ?? "")}
            children={item.props.children}
          />
        ) : (
          item
        ),
      )}
    </PopupMenu>
  ));

  const currentPath = location.href({ excludeSearch: true });

  const selectedTab = tabs.find(
    (tab) => tab.props.to && currentPath.startsWith(location.linkTo(tab.props.to)),
  );

  // Store the currently selected tab in lastTab so we can restore it when
  // nothing in the overflow menu is selected.
  useEffect(() => {
    if (selectedTab) {
      setLastTab(selectedTab ?? null);
    }

    popup.hide();
  }, [selectedTab?.props.to]);

  const tab = selectedTab ?? lastTab ?? tabs[0] ?? null;

  function togglePopup() {
    popup.toggle(ref);
  }

  function onArrowClick(e: MouseEvent<HTMLDivElement>) {
    // Don't let the click bubble up.
    e.stopPropagation();

    // Also don't let the <a> link be followed.
    e.preventDefault();

    togglePopup();
  }

  return (
    <StyledToolbarOverflowTab data-is-toolbar-tab ref={ref}>
      <ToolbarTab
        to={selectedTab ? undefined : tab?.props.to}
        onClick={selectedTab ? togglePopup : undefined}
        selected={!!selectedTab}
      >
        <div className="text">{tab?.props.children ?? "More"}</div>
        <div className="separator" />
        <div className="arrow" data-popup-target onClick={selectedTab ? undefined : onArrowClick}>
          <ChevronDown />
        </div>
      </ToolbarTab>
    </StyledToolbarOverflowTab>
  );
}

function isToolbarTab(item: ReactNode): item is ReactElement<ToolbarTabProps> {
  return isValidElement(item) && !!item.type?.["isToolbarTab"];
}

export const StyledToolbarOverflowTab = styled.div`
  display: flex;

  > ${StyledToolbarTabLink}, > ${StyledToolbarTabButton} {
    flex-grow: 1;

    /* "Undo" the padding set by ToolbarTab. */
    padding-top: 0;
    padding-bottom: 0;
    padding-right: 0;

    > .separator {
      align-self: stretch;
      margin: 7px 0 7px 10px;
      width: 1px;
      background: ${colors.separator()};
    }

    &[data-selected="true"] {
      > .separator {
        display: none;
      }
    }

    > .arrow {
      padding: 0 5px 0 3px;
      align-self: stretch;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const StyledPopupMenuTab = styled(PopupMenuText)`
  &[data-prefix-active="true"] {
    font: ${fonts.displayBold({ size: 15, line: "22px" })};
  }
`;
