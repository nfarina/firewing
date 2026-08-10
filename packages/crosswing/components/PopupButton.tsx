import { ChevronDown } from "lucide-react";
import { RefObject, useImperativeHandle, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors";
import { fonts } from "../fonts/fonts";
import { Popup, PopupTarget } from "../modals/popup/usePopup";
import { Button } from "./Button";

export type PopupButtonRef = {
  /** Shows the associated popup with the button as the target. */
  show(): void;
  /** Hides the associated popup. */
  hide(): void;
  /** Shows the popup if not shown, otherwise hides. */
  toggle: (target: PopupTarget) => void;
};

/**
 * A button that renders a down arrow icon to indicate that it opens a popup
 * menu.
 */
export function PopupButton({
  ref,
  popupRef,
  children,
  popup,
  onClick,
  hideDisclosure = false,
  ...rest
}: Omit<Parameters<typeof Button>[0], "right"> & {
  popupRef?: RefObject<PopupButtonRef | null>;
  popup: Popup<[]> | null;
  hideDisclosure?: boolean;
}) {
  const backupRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(popupRef, () => ({
    show() {
      popup?.show(ref ?? backupRef);
    },
    hide() {
      popup?.hide();
    },
    toggle(target) {
      popup?.toggle(target);
    },
  }));

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    popup?.onClick?.(e);
  }

  return (
    <StyledPopupButton
      {...rest}
      ref={ref ?? backupRef}
      onClick={handleClick}
      data-is-open={popup?.visible}
      children={children}
      right={!hideDisclosure && <ChevronDown size={18} className="down-arrow" />}
    />
  );
}

export const StyledPopupButton = styled(Button)`
  > .right {
    width: 20px;
    height: 20px;
    margin-right: -4px;
    /* Too distracting. */
    /* transition: transform 0.2s ease-in-out; */
  }

  &[data-is-open="true"] {
    background: ${colors.buttonBackgroundHover()};

    > .right {
      transform: scaleY(-1);
    }
  }

  &[data-new-style="true"] {
    > .children {
      font: ${fonts.display({ size: 14 })};
    }

    > .right {
      margin-left: -5px;
    }
  }
`;
