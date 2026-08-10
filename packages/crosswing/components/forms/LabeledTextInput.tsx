import { FocusEvent, useId, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { StyledTextInput, TextInput } from "./TextInput.js";

export function LabeledTextInput({
  title,
  label,
  style,
  className,
  disabled,
  onFocus,
  onBlur,
  children,
  newStyle = false,
  ...rest
}: Parameters<typeof TextInput>[0] & {
  /** If provided, the title will be placed to the left of the input, like a table column. */
  title?: string;
  /** If provided, the label will be placed above the input, like a form. */
  label?: string;
  newStyle?: boolean;
}) {
  const id = useId();

  // Track whether you've ever focused the input so we don't open up a new
  // blank form with lots of "Required" errors right away.
  const [hasEverFocused, setHasEverFocused] = useState(false);
  const [focused, setFocused] = useState(false);

  function onInputFocus(e: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    setHasEverFocused(true);
    onFocus?.(e);
  }

  function onInputBlur(e: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(e);
  }

  // Mirror logic from <TextInput>.
  const showError = !!rest.error && (!!rest.value || hasEverFocused) && !focused;

  return (
    <StyledLabeledTextInput
      style={style}
      className={className}
      data-has-title={!!title}
      data-has-label={!!label}
      data-numeric={!!rest.numeric}
      data-disabled={disabled}
      data-error={showError}
      data-new-style={newStyle}
    >
      {newStyle && label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <TextInput
        newStyle={newStyle}
        disabled={disabled}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        id={id}
        {...rest}
      />
      {title && !newStyle && <span className="title">{title}</span>}
      {label && !newStyle && <span className="label">{label}</span>}
      {children}
    </StyledLabeledTextInput>
  );
}

export const StyledLabeledTextInput = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  min-height: 60px;
  box-sizing: border-box;

  &[data-new-style="false"] {
    > ${StyledTextInput} {
      flex-grow: 1;

      > input {
        padding: 10px;
      }
    }

    &[data-has-title="true"] {
      > ${StyledTextInput} {
        > input {
          text-align: right;
          font: ${fonts.display({ size: 18 })};
        }
      }

      &[data-numeric="true"] {
        > ${StyledTextInput} > input {
          font: ${fonts.numeric({ size: 18 })};
        }
      }
    }

    &[data-has-label="true"] > ${StyledTextInput} > input {
      padding: 30px 10px 10px;
    }

    /* Float the title so the input fills our control space with interactivity. */
    > .title {
      position: absolute;
      left: 10px;
      top: 10px;
      right: 10px;
      bottom: 10px;
      font: ${fonts.display({ size: 16, line: "1" })};
      color: ${colors.text()};
      pointer-events: none;
      display: flex;
      flex-flow: row;
      align-items: center;
    }

    /* Float the label so the input fills our control space with interactivity. */
    > .label {
      position: absolute;
      left: 10px;
      top: 10px;
      font: ${fonts.displayBold({ size: 11, line: "11px" })};
      color: ${colors.text()};
      letter-spacing: 1px;
      text-transform: uppercase;
      pointer-events: none;
      transition: color 0.2s ease-in-out;
    }

    &[data-error="true"] {
      > .label {
        color: ${colors.red()};
      }
    }

    &[data-disabled="true"] {
      > .label {
        color: ${colors.text({ alpha: 0.5 })};
      }
    }

    &[data-error="true"][data-disabled="true"] {
      > .label {
        color: ${colors.red({ alpha: 0.5 })};
      }
    }
  }

  &[data-new-style="true"] {
    gap: 8px;

    > .label {
      font: ${fonts.displayMedium({ size: 14, line: "20px" })};
    }

    &[data-disabled="true"] {
      > .label {
        color: ${colors.text({ alpha: 0.5 })};
      }
    }

    &[data-has-label="false"] {
      min-height: 30px;
    }
  }
`;
