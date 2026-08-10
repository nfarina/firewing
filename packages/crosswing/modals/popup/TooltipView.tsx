import { useLayoutEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { HotKey } from "../../hooks/useHotKey.js";
import { renderHotkey } from "./HotkeyView.js";
import { PopupPlacement, PopupView } from "./PopupView.js";

/**
 * Helper to add data-tooltip attributes to an element in a typesafe way.
 * Title must be a string because it will be rendered out as a data-tooltip
 * attribute in HTML (as will the other props).
 */
export function tooltip(
  title: string | null,
  props: {
    /** Hotkey for the tooltip. */
    hotkey?: HotKey;
    /** Hotkey for Windows. */
    hotkeyWin?: HotKey;
    /** Hotkey for Mac. */
    hotkeyMac?: HotKey;
    /** Placement of the tooltip. */
    placement?: PopupPlacement;
    /** Whether the tooltip is hidden. Can be truthy or falsy. */
    hidden?: any;
    /** Delay in milliseconds before the tooltip is shown. */
    delay?: number | boolean;
    /** Renders the tooltip in a red color. Can be truthy or falsy. */
    destructive?: any;
  } = {},
) {
  return {
    "data-tooltip": title,
    ...(props.hotkey && { "data-tooltip-hotkey": props.hotkey }),
    ...(props.hotkeyWin && { "data-tooltip-hotkey-win": props.hotkeyWin }),
    ...(props.hotkeyMac && { "data-tooltip-hotkey-mac": props.hotkeyMac }),
    ...(props.placement && { "data-tooltip-placement": props.placement }),
    ...(props.hidden && { "data-tooltip-hidden": "true" }),
    ...(props.delay && { "data-tooltip-delay": String(props.delay) }),
    ...(props.destructive && {
      "data-tooltip-destructive": "true",
    }),
  };
}

export function TooltipView({
  tooltip: tooltipText,
  target,
  children,
  autoFocus = false,
  ...rest
}: Parameters<typeof PopupView>[0] & {
  /** Can be HTML. */
  tooltip?: string;
  /**
   * Target element to point at, will pull the tooltip text from here if children
   * are not provided.
   */
  target: Element;
}) {
  const [text, setText] = useState("");
  const [destructive, setDestructive] = useState(false);

  // Sign up for mouseout events on the target so we can close ourself.
  useLayoutEffect(() => {
    if (!target) return;

    const handleMouseOut = () => {
      rest.onClose?.();
    };

    target.addEventListener("mouseleave", handleMouseOut);

    return () => {
      target.removeEventListener("mouseleave", handleMouseOut);
    };
  }, [target]);

  useLayoutEffect(() => {
    // If we have direct children, we don't need to do anything here.
    if (children) return;

    const updateState = () => {
      const tooltip = tooltipText ?? target?.getAttribute("data-tooltip");
      const hidden = target?.getAttribute("data-tooltip-hidden") === "true";
      const destructive = target?.getAttribute("data-tooltip-destructive") === "true";

      if (hidden) {
        rest.onClose?.();
      }

      // Special little styling for hotkeys.
      const hotkey = getHotkey(target);

      setText(
        (tooltip ?? `<span class="empty"></span>`) +
          (hotkey ? `<span class="hotkey">${hotkey}</span>` : ""),
      );
      setDestructive(destructive);
    };

    updateState();

    if (!target) return;

    // Sign up for mutation events on the target so we can update our state.
    const observer = new MutationObserver(updateState);
    observer.observe(target, { attributes: true });

    return () => observer.disconnect();
  }, [children, tooltipText, target]);

  return (
    <StyledTooltipView
      background={destructive ? colors.red({ darken: 0.3 }) : colors.gray900()}
      backgroundDark={destructive ? colors.red({ lighten: 0.25 }) : colors.gray50()}
      arrowBackground={destructive ? colors.red({ darken: 0.3 }) : colors.gray900()}
      arrowBackgroundDark={destructive ? colors.red({ lighten: 0.25 }) : colors.gray50()}
      outlineBorder={false}
      data-destructive={destructive}
      autoFocus={autoFocus}
      {...rest}
    >
      {children ?? <div dangerouslySetInnerHTML={{ __html: text }} />}
    </StyledTooltipView>
  );
}

export const StyledTooltipView = styled(PopupView)`
  /* Don't accidentally capture the mouse as it's moving between targets. */
  pointer-events: none !important; /* Override usePopup's pointer-events: auto. */
  border-radius: 6px !important; /* Override usePopup again */
  max-width: 300px !important; /* Override …not sure who… */
  outline: none !important;
  color: ${colors.gray50()};

  @media (prefers-color-scheme: dark) {
    color: ${colors.gray900()};
  }

  &[data-destructive="true"] {
    color: ${colors.red({ lighten: 0.35 })};

    @media (prefers-color-scheme: dark) {
      color: ${colors.red({ darken: 0.45 })};
    }
  }

  &[data-outline-border="true"] {
    > .children {
      border-radius: 6px;
      box-shadow: none;
    }

    &[data-destructive="true"] {
      > .children {
        box-shadow: none;
      }
    }
  }

  &[data-outline-border="false"] {
    > .children {
      border-radius: 6px;
      box-shadow: none;
    }
  }

  > .children {
    /* Add some default style to the content. */
    font: ${fonts.displayMedium({ size: 13, line: "17px" })};
    word-break: break-word;
    padding: 4px 8px;
    text-align: center;
    ${"text-wrap: pretty;"}

    .hotkey {
      margin-left: 6px;
      opacity: 0.5;
      letter-spacing: 0.05em;

      > .key {
        letter-spacing: 0;
      }
    }

    .empty + .hotkey {
      margin-left: 0;
    }
  }
  &[data-placement="left"] {
    > .children {
      text-align: left;
    }
  }

  &[data-placement="right"] {
    > .children {
      text-align: left;
    }
  }
`;

function getHotkey(target: Element): string | null {
  const hotkey = (target?.getAttribute("data-tooltip-hotkey") ?? null) as HotKey | null;
  const hotkeyWin = (target?.getAttribute("data-tooltip-hotkey-win") ?? null) as HotKey | null;
  const hotkeyMac = (target?.getAttribute("data-tooltip-hotkey-mac") ?? null) as HotKey | null;

  return renderHotkey({ key: hotkey, win: hotkeyWin, mac: hotkeyMac });
}
