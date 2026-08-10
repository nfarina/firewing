import { HTMLAttributes, ReactNode, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { HostContext } from "../../host/context/HostContext.js";
import { Toggle, ToggleSize } from "./Toggle.js";

export function LabeledToggle({
  label,
  detail,
  on,
  size,
  onClick,
  disabled,
  newStyle,
  ...rest
}: HTMLAttributes<HTMLDivElement> &
  Pick<Parameters<typeof Toggle>[0], "on" | "size" | "disabled" | "onClick"> & {
    label: ReactNode;
    detail?: ReactNode;
    newStyle?: boolean;
  }) {
  const { container } = use(HostContext);
  const defaultSize: ToggleSize =
    container === "ios" || container === "android" ? "normal" : "smaller";

  // We don't want to shadow the button by making ourselves a <button>
  // as well, so we'll just sign up for the onClick event.
  return (
    <StyledLabeledToggle
      data-new-style={!!newStyle}
      data-disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      <div className="content">
        <div className="label" children={label} />
        <div className="detail" children={detail} />
      </div>
      <Toggle
        on={on}
        size={size ?? defaultSize}
        disabled={disabled}
        // onClick={onClick}
      />
    </StyledLabeledToggle>
  );
}

export const StyledLabeledToggle = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  min-height: 50px;
  padding: 0 10px;
  box-sizing: border-box;
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${colors.buttonBackgroundHover()};
    }
  }

  > * {
    flex-shrink: 0;
  }

  > .content {
    width: 0;
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    margin: 7px 20px 7px 0;

    > .label {
      font: ${fonts.displayBold({ size: 14, line: "20px" })};
      color: ${colors.text()};
      transition: opacity 0.2s ease-in-out;
      word-break: break-word;
      /* Only way to defeat ts-styled-plugin's lints right now. */
      ${"text-wrap: pretty;"}
    }

    > .detail {
      font: ${fonts.display({ size: 14, line: "20px" })};
      color: ${colors.textSecondary()};
      transition: opacity 0.2s ease-in-out;
      word-break: break-word;
      /* Only way to defeat ts-styled-plugin's lints right now. */
      ${"text-wrap: pretty;"}
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > .content > .label {
      opacity: 0.5;
    }
  }

  &[data-new-style="true"] {
    padding-left: 0;

    > .content > .label {
      font: ${fonts.display({ size: 14, line: "20px" })};
    }

    > .content > .detail {
      font: ${fonts.display({ size: 12, line: "16px" })};
    }
  }
`;
