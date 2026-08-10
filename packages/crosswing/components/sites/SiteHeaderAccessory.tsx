import {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
  useImperativeHandle,
  useRef,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { Popup } from "../../modals/popup/PopupView.js";
import { StyledUnreadBadge, UnreadBadge } from "../../router/tabs/UnreadBadge.js";
import { Clickable } from "../Clickable.js";
import { PopupButtonRef } from "../PopupButton.js";

export type SiteHeaderAccessory = {
  /** A unique key for the accessory. */
  key: string;
  /** The icon to display. */
  icon: ReactNode;
  /** For new site, temporary. */
  title?: ReactNode;
  /** The size of the icon. */
  iconSize?: [string, string];
  /** Set a number to render an "unread items" badge. */
  unread?: number | null;
  /** Called when the accessory is clicked. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * On larger screens, accessories will always be in the top nav. On smaller
   * screens, you can elect to relocate the accessory to the sidebar. This is
   * appropriate for things like the "account button" which is rarely used.
   * Default is "nav".
   */
  mobilePlacement?: "nav" | "sidebar";
  /** True if you want to (temporarily?) hide this accessory. */
  hidden?: boolean;
  /** Optional managed popup to show when the accessory is clicked. */
  popup?: Popup<[]> | null;
  /**
   * An optional ref you can pass if you need to programatically open a popup.
   */
  popupRef?: RefObject<PopupButtonRef | null>;
};

export function SiteHeaderAccessoryView({
  accessory,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & {
  accessory: SiteHeaderAccessory;
}) {
  const { icon, iconSize = ["24px", "24px"], unread, onClick, popup, popupRef } = accessory;

  const ref = useRef<HTMLButtonElement>(null);

  useImperativeHandle(popupRef, () => ({
    show() {
      popup?.show(ref);
    },
    hide() {
      popup?.hide();
    },
    toggle(target) {
      popup?.toggle(target);
    },
  }));

  const [width, height] = iconSize;

  return (
    <StyledSiteHeaderAccessoryView ref={ref} onClick={onClick} {...rest}>
      <div style={{ width, height }} data-popup-target>
        {icon}
      </div>
      {!!unread && <UnreadBadge>{unread}</UnreadBadge>}
    </StyledSiteHeaderAccessoryView>
  );
}

export const StyledSiteHeaderAccessoryView = styled(Clickable)`
  display: flex;
  flex-flow: row;
  position: relative;
  align-items: center;
  justify-content: center;

  > *[data-popup-target] {
    > svg {
      width: 100%;
      height: 100%;
      color: ${colors.text()};
    }
  }

  > ${StyledUnreadBadge} {
    position: absolute;
    top: calc(50% - 16px);
    right: 0px;
    transform: scale(0.85);
    box-shadow: 0 0 0 3px ${colors.textBackground()};
  }
`;
