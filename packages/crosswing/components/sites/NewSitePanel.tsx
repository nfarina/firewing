import { HTMLAttributes, ReactNode, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors";
import { tooltip } from "../../modals/popup/TooltipView";
import { AutoBorderView } from "../AutoBorderView";
import { Button } from "../Button";
import { X } from "lucide-react";

export function NewSitePanel({
  accessories,
  onClose,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  accessories?: ReactNode;
  onClose?: () => void;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <StyledNewSitePanel {...rest}>
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
      padding-right: 5px;
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

    > * {
      flex-shrink: 0;
      height: 0;
      flex-grow: 1;
    }
  }
`;
