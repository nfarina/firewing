import { CSSProperties, HTMLAttributes, ReactNode, use, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors";
import { tooltip } from "../../modals/popup/TooltipView";
import { AutoBorderView } from "../AutoBorderView";
import { Button } from "../Button";
import { NewSiteContext, shouldRenderAccessory } from "./NewSiteContext";
import { X } from "lucide-react";

export function NewSitePanel({
  accessories,
  onClose,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  accessories?: ReactNode;
  onClose?: () => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { siteAccessory, siteLayout } = use(NewSiteContext);

  // An open panel owns the top-right corner of the window, which is exactly
  // where the site layout floats its accessory (usually the account button).
  // Reserve room for it here, the same way NewSiteHeader does when the panel
  // isn't covering it — otherwise our own accessories end up underneath it.
  const cssProps = {
    "--site-accessory-width": shouldRenderAccessory(siteAccessory, siteLayout)
      ? siteAccessory.size.width + "px"
      : "0px",
    ...style,
  } as CSSProperties;

  return (
    <StyledNewSitePanel style={cssProps} {...rest}>
      <AutoBorderView className="header">
        <Button
          newStyle
          className="panel-toggle"
          icon={<X />}
          onClick={onClose}
          {...tooltip("Close panel", { hotkey: "ctrl+e" })}
        />
        {!!accessories && <div className="accessories" children={accessories} />}
      </AutoBorderView>
      <div className="content" ref={contentRef} children={children} />
    </StyledNewSitePanel>
  );
}

export const StyledNewSitePanel = styled.div`
  display: flex;
  flex-flow: column;
  background: ${colors.textBackgroundPanel()};

  > * {
    flex-shrink: 0;
  }

  > .header {
    z-index: 1;
    box-sizing: border-box;
    padding: 8px 10px;
    height: 56px;
    display: flex;
    flex-flow: row;

    > .panel-toggle {
      align-self: flex-start;
      flex-shrink: 0;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    > .accessories {
      flex-grow: 1;
      padding-right: calc(5px + var(--site-accessory-width, 0px));
      display: flex;
      flex-flow: row;
      justify-content: flex-end;
      gap: 10px;
    }
  }

  > .content {
    height: 0;
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    /* A containing block for whatever we're hosting. Without it, absolutely
       positioned content (a full-bleed NavLayout header, say) escapes all the
       way out to the site layout and lands on the window's top-right corner,
       on top of the site accessory. */
    position: relative;

    > * {
      flex-shrink: 0;
      height: 0;
      flex-grow: 1;
    }
  }
`;
