import { usePopup } from "../../../../modals/popup/usePopup.js";
import { Button } from "../../../Button.js";
import { PopupMenu, PopupMenuHeader, PopupMenuText } from "../../../PopupMenu.js";

export default function PopupButton() {
  const popup = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Message" />
      <PopupMenuText children="Hello World" />
    </PopupMenu>
  ));

  return <Button primary children="Show Popup" onClick={popup.onClick} />;
}
