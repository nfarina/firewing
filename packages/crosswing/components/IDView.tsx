import { Copy } from "lucide-react";
import { HTMLAttributes, MouseEvent, use } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { ModalContext } from "../modals/context/ModalContext.js";

export function IDView({
  name,
  id,
  truncate,
  onClick,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  name: string;
  id: string;
  truncate?: number | false;
}) {
  const { showToast } = use(ModalContext);

  function onViewClick(e: MouseEvent<HTMLDivElement>) {
    navigator.clipboard.writeText(id);
    showToast(`${name} ID copied to clipboard.`);
    onClick?.(e);
  }

  // If the ID looks like something we got from Firebase, truncate it after
  // the first 6 characters.
  if (truncate === undefined && looksLikeId(id)) {
    truncate = 6;
  }

  return (
    <StyledIDView onClick={onViewClick} {...rest}>
      <Copy />
      <span className="text">{truncate ? id.slice(0, truncate) : id}</span>
    </StyledIDView>
  );
}

/** Returns true if the string looks like a Firebase ID. */
export function looksLikeId(text: string) {
  return /^[0-9a-z]{20,28}$/i.test(text);
}

export const StyledIDView = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row;
  align-items: center;
  color: ${colors.textSecondary()};
  transition: color 0.2s ease-in-out;
  cursor: pointer;

  > svg {
    flex-shrink: 0;
    margin-right: 4px;
    width: 13px;
    height: 13px;
  }

  > .text {
    font: ${fonts.displayMono({ size: 13 })};
    transform: translateY(-1px);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${colors.text()};
    }
  }
`;
