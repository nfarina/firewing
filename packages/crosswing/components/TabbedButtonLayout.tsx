import {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  isValidElement,
  use,
  useRef,
  useState,
} from "react";
import { styled } from "styled-components";
import { ColorBuilder, colors, shadows } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { flattenChildren } from "../hooks/flattenChildren.js";
import { useDebounced } from "../hooks/useDebounced.js";
import { HotKey, useHotKey } from "../hooks/useHotKey.js";
import { useResettableState } from "../hooks/useResettableState.js";
import { HostContext } from "../host/context/HostContext.js";
import { RouterContext } from "../router/context/RouterContext.js";
import { Redirect } from "../router/redirect/Redirect.js";
import { UnreadBadge } from "../router/tabs/UnreadBadge.js";
import { easing } from "../shared/easing.js";
import { Button } from "./Button.js";

export interface TabbedButtonProps {
  icon?: ReactNode;
  title?: ReactNode;
  /** Allow any value type in case you want to use enums. */
  value?: any;
  children?: ReactNode;
  lazy?: boolean;
  /** (For buttonStyle only) Whether the width of the tab should fit its content, instead of expanding to fill the available space. Default false. */
  fit?: boolean;
  /** Badges the tab like the mobile tab bar. */
  badge?: number | null;
  /** The color of the badge. */
  badgeColor?: ColorBuilder;
  /** The background color of the badge. */
  badgeBackgroundColor?: ColorBuilder;
  /** Optional props to pass to the button. */
  buttonProps?: any;
  /** Optional hotkey to select this tab. */
  hotkey?: HotKey;
}

export function TabbedButtonLayout({
  value,
  defaultValue,
  onValueChange,
  layout = "fixed",
  searchParam,
  disabled,
  children,
  style,
  buttonStyle,
  pill = true,
  pad = true,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  value?: any;
  defaultValue?: any;
  onValueChange?: (value: any) => any;
  /**
   * Determines the layout behavior of the content area.
   *
   * - **`"fixed"` (default):**
   *   The content area attempts to fill available vertical space if `TabbedButtonLayout`
   *   is a flex item in a height-managed container. Tab contents are absolutely
   *   positioned, overlaying each other within this area. Switching tabs
   *   **does not** change the height of the content area, ensuring a stable layout
   *   below the tabs. Ideal for self-contained UI panels, modals, or sections
   *   within a fixed application layout.
   *
   * - **`"grow"`:**
   *   The content area's height is determined by the actual height of the
   *   currently active tab's content. Tab contents are in the normal document flow
   *   (though only one is visible). Switching tabs **can** change the overall
   *   height of the component, potentially causing content below it on the page
   *   to reflow. Suitable when the tabbed interface is a primary section of a
   *   scrolling page and dynamic height is acceptable or desired.
   *
   * @default "fixed"
   */
  layout?: "fixed" | "grow";
  /** If defined, will store the current tab value in the querystring (using router). */
  searchParam?: string;
  disabled?: boolean;
  children?:
    | Array<ReactElement<TabbedButtonProps> | null | boolean>
    | ReactElement<TabbedButtonProps>
    | null
    | boolean;
  /** If true, will render as a horizontal list of buttons instead of a tab/track layout. */
  buttonStyle?: boolean;
  pill?: boolean;
  /** Whether to pad the tabs with 20px vertical and 10px horizontal space. */
  pad?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // We always want to render using "nextLocation" instead of "location" because
  // content may be loading via <Suspense> and we want to highlight the tab that
  // will be selected next regardless of that loading state.
  const { history, location, nextLocation: anyNextLocation } = use(RouterContext);
  const { container } = use(HostContext);

  // The nextLocation could be _anywhere_. We only want to pre-render the
  // active button if the path matches our current location. Otherwise we might
  // want to highlight the default first button when no querystring is present
  // (because we're going to like, another screen entirely, or navigating
  // backwards in a <Navs>).
  const nextLocation =
    anyNextLocation.claimedPath() === location.claimedPath() ? anyNextLocation : location;

  // Coerce children to array, flattening fragments and falsy conditionals.
  const buttons = flattenChildren(children).filter(isTabbedButton);

  const hotkeys = buttons.map((b) => b.props.hotkey).filter(Boolean) as HotKey[];
  useHotKey(hotkeys, { target: ref }, (hotkey) => {
    const button = buttons.find((b) => b.props.hotkey === hotkey);
    if (button) {
      selectTab(button.props.value);
    }
  });

  // What React wants us to render right now, possibly suspended.
  const paramValue = searchParam && location.searchParams().get(searchParam);
  const paramChild = paramValue && buttons.find((c) => c.props.value === paramValue);

  // What we will be rendering next, possibly suspended.
  const nextParamValue = searchParam && nextLocation.searchParams().get(searchParam);

  const [innerValue, setInnerValue] = useResettableState(() => {
    return nextParamValue ?? defaultValue ?? buttons[0]?.props.value ?? 0;
  }, [nextParamValue, defaultValue, buttons.length]);

  // Keep track of child values we've rendered, for lazy children.
  const [renderedValues, setRenderedValues] = useState<Set<string>>(new Set());

  const resolvedValue = value ?? innerValue;
  const selectedIndex = buttons.findIndex((child, i) => (child.props.value ?? i) === resolvedValue);

  // Wait to render our children until after the tab animation is complete,
  // only when running in a native Android app, otherwise it feels choppy.
  const delay = container === "android" ? 300 : 0;
  const debouncedValue = useDebounced(resolvedValue, { delay });

  function selectTab(newValue: any) {
    onValueChange?.(newValue);

    if (!value) {
      // "Uncontrolled" component, use our own state.
      setInnerValue(newValue);

      // Update our router's location with the new search param value if needed.
      if (searchParam) {
        const newLocation = nextLocation.withParam(searchParam, newValue);
        history.navigate(newLocation.href(), { replace: true });
      }
    }
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const track = (e.target as HTMLElement).parentElement!;

    function onTouchMove(e: TouchEvent) {
      const rect = track.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left; // x position within the track.

      const childWidth = rect.width / buttons.length;
      let childIndex = Math.floor(x / childWidth);
      childIndex = Math.max(childIndex, 0);
      childIndex = Math.min(childIndex, buttons.length - 1);
      const child = buttons[childIndex];
      selectTab(child.props.value ?? childIndex);
    }

    function onTouchEnd(e: TouchEvent) {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    }

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }

  // Update our rendered values with whatever we are rendering.
  if (!renderedValues.has(debouncedValue)) {
    const nowRendered = new Set(renderedValues);
    nowRendered.add(debouncedValue);
    setRenderedValues(nowRendered);
  }

  function renderChild(child: ReactElement<TabbedButtonProps>, i: number) {
    const childValue = child.props.value ?? i;

    if (child.props.lazy && !renderedValues.has(childValue)) {
      // Don't render this value unless it's been selected before.
      return null;
    }

    return (
      <div
        key={String(childValue)}
        className="tab-content"
        children={child.props.children}
        data-selected={childValue === debouncedValue}
      />
    );
  }

  const cssProps = {
    ...style,
    "--selected-index": selectedIndex,
    "--child-count": buttons.length,
    "--border-radius": pill ? "9999px" : "9px",
    "--border-radius-inner": pill ? "9999px" : "7px",
  } as CSSProperties;

  // Using our Router integration, and trying to render an invalid paramValue?
  // Redirect to our first child's value if it defines one.
  // Note that we are not using the "nextLocation" value here, because we want
  // React might be concurrently rendering us.
  if (searchParam && !!paramValue && !paramChild && buttons.length > 1 && buttons[0].props.value) {
    return <Redirect to={location.withParam(searchParam, buttons[0].props.value).href()} />;
  }

  return (
    <StyledTabbedButtonLayout
      ref={ref}
      data-button-style={!!buttonStyle}
      data-layout={layout}
      data-hide-tabs={buttons.length === 1}
      data-disabled={!!disabled}
      data-pad={!!pad}
      style={cssProps}
      {...rest}
    >
      <div className="tabs" role="tablist">
        <div className="track">
          <div className="background" onTouchStart={onTouchStart} />
          {buttons.map((child, i) => (
            <Button
              newStyle
              data-fit={!!child.props.fit}
              disabled={!!disabled}
              key={String(child.props.value ?? i)}
              data-selected={(child.props.value ?? i) === resolvedValue}
              onClick={() => selectTab(child.props.value ?? i)}
              role="tab"
              aria-selected={(child.props.value ?? i) === resolvedValue}
              {...child.props.buttonProps}
            >
              <TabButtonContent>
                {child.props.icon}
                {child.props.title}
                {child.props.badge ? (
                  <UnreadBadge
                    children={child.props.badge}
                    color={child.props.badgeColor}
                    backgroundColor={child.props.badgeBackgroundColor}
                  />
                ) : null}
              </TabButtonContent>
            </Button>
          ))}
        </div>
      </div>
      <div className="content">{buttons.map(renderChild)}</div>
    </StyledTabbedButtonLayout>
  );
}

export const StyledTabbedButtonLayout = styled.div`
  display: flex;
  flex-flow: column;

  > .tabs {
    flex-shrink: 0;
    display: flex;
    flex-flow: column;
  }

  &[data-pad="true"] > .tabs {
    padding: 20px 10px;
  }

  &[data-hide-tabs="true"] {
    > .tabs {
      display: none;
    }
  }

  &[data-button-style="false"] > .tabs > .track {
    display: flex;
    flex-flow: row;
    background: ${colors.gray200()};
    border-radius: var(--border-radius);
    position: relative;
    min-height: 38px;

    @media (prefers-color-scheme: dark) {
      background: ${colors.gray950()};
    }

    > .background {
      position: absolute;
      transition: left 0.3s ${easing.outCubic};
      left: calc(4px + var(--selected-index) * (100% / var(--child-count)));
      top: 4px;
      width: calc((100% / var(--child-count)) - 4px * 2);
      height: calc(100% - 4px * 2);
      background: ${colors.textBackground()};
      border-radius: var(--border-radius-inner);
      box-shadow: ${shadows.cardSmall()};
    }

    > button {
      width: 0;
      flex-grow: 1;
      flex-shrink: 0;
      background: none;
      z-index: 1;
      font: ${fonts.displayMedium({ size: 14 })};
      color: ${colors.text()};
      transition: color 0.2s linear;
      /* For outline. */
      border-radius: var(--border-radius);

      &[data-selected="true"] {
        font: ${fonts.displayBold({ size: 14 })};
        pointer-events: none;
      }

      &[data-selected="false"] {
        color: ${colors.textSecondary()};
      }
    }
  }

  &[data-button-style="true"] > .tabs > .track {
    display: flex;
    flex-flow: row;

    > .background {
      display: none;
    }

    > button {
      flex-grow: 1;
      flex-shrink: 0;
      min-height: 38px;
      transition: transform linear 0.1s;
      padding: 6px 8px;

      &[data-fit="true"] {
        flex-grow: 0;
        width: auto;
      }

      &[data-selected="false"] {
        font: ${fonts.display({ size: 14 })};
        color: ${colors.text()};

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            background: ${colors.buttonBackgroundGlow()};
          }
        }
      }

      &[data-selected="true"] {
        background: ${colors.linkActiveBackground()};
        font: ${fonts.displayBold({ size: 14 })};
      }
    }
  }

  &[data-layout="fixed"] > .content {
    height: 0;
    flex-grow: 1;
    position: relative;

    > .tab-content {
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
      display: flex;

      > * {
        flex-grow: 1;
      }
    }

    > .tab-content[data-selected="false"] {
      display: none;
    }
  }

  &[data-layout="grow"] > .content {
    flex-shrink: 0;
    display: flex;
    flex-flow: column;
    flex-grow: 1;

    > .tab-content {
      flex-grow: 1;
      display: flex;
      flex-flow: column;

      > * {
        flex-grow: 1;
      }
    }

    > .tab-content[data-selected="false"] {
      display: none;
    }
  }

  &[data-disabled="true"] {
    pointer-events: none;
  }
`;

export function TabbedButton(props: TabbedButtonProps) {
  return null; // Doesn't actually render anything, just captures props.
}
// We use this instead of comparing item.type === TabbedButton because that class
// pointer is not stable during development with hot reloading.
TabbedButton.isTabbedButton = true;

function isTabbedButton(child: ReactNode): child is ReactElement<TabbedButtonProps> {
  return isValidElement(child) && !!child.type?.["isTabbedButton"];
}

const TabButtonContent = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 6px;

  > svg {
    width: 16px;
    height: 16px;
  }
`;
