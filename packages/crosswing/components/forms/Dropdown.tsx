import { ReactNode, RefObject, useImperativeHandle } from "react";
import { styled } from "styled-components";
import { PopupPlacement } from "../../modals/popup/getPopupPlacement.js";
import { usePopup } from "../../modals/popup/usePopup.js";
import { PopupButton } from "../PopupButton.js";
import { PopupMenu, PopupMenuText } from "../PopupMenu.js";

export type DropdownItem = Parameters<typeof PopupMenuText>[0] & {
  value: string;
  /** Custom display text for the item when it's selected (can be different from children, which is used for the popup menu). */
  display?: ReactNode;
};

export type DropdownRef = {
  /** Whether the dropdown is currently shown. We can't do this in PopupButton itself because PopupButton doesn't manage its own popup. */
  visible(): boolean;
};

export function Dropdown({
  items = [],
  value,
  onValueChange,
  placeholder = "Select",
  disabled,
  maxPopupWidth,
  dropdownRef,
  placement,
  autoFocus,
  keyboardNavigation,
  ...rest
}: Omit<Parameters<typeof PopupButton>[0], "popup"> & {
  items?: DropdownItem[];
  value?: string;
  onValueChange?: (newValue: string) => void;
  placeholder?: string;
  maxPopupWidth?: number;
  dropdownRef?: RefObject<DropdownRef | null>;
  placement?: PopupPlacement;
  autoFocus?: boolean;
  keyboardNavigation?: boolean;
}) {
  const selectedItem = items.find((item) => item.value === value);

  function renderDisplayText() {
    if (selectedItem && selectedItem.display) {
      return selectedItem.display;
    } else if (selectedItem && selectedItem.children) {
      return selectedItem.children;
    } else {
      return placeholder;
    }
  }

  const popup = usePopup(
    () => (
      <PopupMenu
        autoFocus={autoFocus}
        keyboardNavigation={keyboardNavigation}
        style={{
          ...(maxPopupWidth ? { maxWidth: maxPopupWidth } : {}),
        }}
      >
        {items.map(({ value: itemValue, ...itemProps }) => (
          <PopupMenuText
            key={itemValue}
            checked={itemValue === value}
            onClick={() => onValueChange?.(itemValue)}
            keyboardNavigation={keyboardNavigation}
            {...itemProps}
          />
        ))}
      </PopupMenu>
    ),
    { placement },
  );

  useImperativeHandle(
    dropdownRef,
    () => ({
      visible() {
        return popup.visible;
      },
    }),
    [popup.visible],
  );

  return (
    <StyledDropdown newStyle popup={popup} disabled={disabled || items.length === 0} {...rest}>
      <span className="text">{renderDisplayText()}</span>
    </StyledDropdown>
  );
}

export const StyledDropdown = styled(PopupButton)`
  &[data-new-style="true"] {
    min-height: 36px;
  }
`;
