import { styled } from "styled-components";
import { fonts } from "../../fonts/fonts";
import { formatHotKey, HotKey, parseHotKey } from "../../hooks/useHotKey";
import { capitalize } from "../../shared/strings";

export type Hotkeys = {
  key?: HotKey | null;
  win?: HotKey | null;
  mac?: HotKey | null;
};

export function HotkeyView({ hotkeys = null }: { hotkeys?: Hotkeys | null }) {
  return <StyledHotkeyView dangerouslySetInnerHTML={{ __html: renderHotkey(hotkeys) ?? "" }} />;
}

export const StyledHotkeyView = styled.span`
  font: ${fonts.displayBold({ size: 13, line: "17px" })};
  opacity: 0.5;
  letter-spacing: 0.1em;

  > .key {
    letter-spacing: 0;
  }
`;

export function renderHotkey(hotkeys: Hotkeys | null): string | null {
  const resolvedHotkeyStr = navigator.platform.includes("Mac")
    ? (hotkeys?.mac ?? hotkeys?.key ?? "")
    : (hotkeys?.win ?? hotkeys?.key ?? "");

  if (!resolvedHotkeyStr) return null;

  const resolvedHotkey = parseHotKey(resolvedHotkeyStr as any);
  const parts = formatHotKey(resolvedHotkey);
  const modifierKeys = parts.slice(0, -1);
  const key = parts[parts.length - 1];

  return (
    modifierKeys.map((key) => `<span class="modifier">${key}</span>`).join("") +
    `<span class="key">${capitalize(key)}</span>`
  );
}
