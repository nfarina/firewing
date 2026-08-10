import { ChangeEvent, HTMLAttributes, KeyboardEvent, ReactNode, use, useState } from "react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Router } from "../Router.js";
import { RouterLocation } from "../RouterLocation.js";
import { RouterContext } from "../context/RouterContext.js";
import { MemoryHistory } from "../history/MemoryHistory.js";

// For Storybook, when action()ing a navigation event, we mostly want to know
// the path. The location object doesn't print well in the Storybook UI.
export type BrowserNavigateListener = (path: string, location: RouterLocation) => void;

export function BrowserSimulator({
  rootPath,
  initialPath,
  children,
  navigateListener,
  ...rest
}: {
  rootPath?: string;
  initialPath?: string;
  children?: ReactNode;
  navigateListener?: BrowserNavigateListener;
} & HTMLAttributes<HTMLDivElement>) {
  const [history] = useState(() => {
    const memory = new MemoryHistory(initialPath);
    memory.listen((location) => {
      // Send the navigate event to Storybook as an action.
      action("navigate")(location.href(), location);

      // Also call the listener if provided.
      navigateListener?.(location.href(), location);
    });
    return memory;
  });

  return (
    <Router
      path={rootPath}
      history={history}
      render={() => (
        <StyledBrowserSimulator {...rest}>
          <AddressBar />
          <div className="children">{children}</div>
        </StyledBrowserSimulator>
      )}
    />
  );
}

export const StyledBrowserSimulator = styled.div`
  display: flex;
  flex-flow: column;

  > input {
    flex-shrink: 0;
    border-bottom: 1px solid ${colors.separator()};
  }

  /* Hide the address bar when captured for documentation screenshots. */
  html[data-docs-screenshot] && > input {
    display: none;
  }

  > .children {
    height: 0;
    flex-grow: 1;
    display: flex;
    flex-flow: column;

    > * {
      flex-grow: 1;
    }
  }
`;

export function AddressBar() {
  const { history, nextLocation } = use(RouterContext);
  const [focused, setFocused] = useState(false);
  const [draftLocation, setDraftLocation] = useState("");

  function onFocus(e: ChangeEvent<HTMLInputElement>) {
    setFocused(true);
    setDraftLocation(nextLocation.href());
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setDraftLocation(e.target.value);
  }

  function onBlur() {
    setFocused(false);
    history.navigate(nextLocation.linkTo(draftLocation));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onBlur();

      if (e.target instanceof HTMLInputElement) {
        e.target.blur();
      }
    }
  }

  return (
    <StyledAddressBar
      value={focused ? draftLocation : nextLocation.href()}
      onFocus={onFocus}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}

export const StyledAddressBar = styled.input`
  background: ${colors.textBackgroundPanel()};
  padding: 10px;
  font: ${fonts.display({ size: 14, line: "1.3" })};
  color: ${colors.textSecondary()};
  outline: none;
  border: none;
`;
