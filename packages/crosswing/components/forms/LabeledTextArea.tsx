import { FocusEvent, ReactNode, useId, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { StyledTextArea, TextArea } from "./TextArea.js";

export const LabeledTextArea = ({
  label,
  style,
  className,
  disabled,
  onFocus,
  onBlur,
  autoSizing = true,
  children,
  newStyle = false,
  ...rest
}: Parameters<typeof TextArea>[0] & {
  label?: ReactNode;
  newStyle?: boolean;
}) => {
  const id = useId();

  // Track whether you've ever focused the input so we don't open up a new
  // blank form with lots of "Required" errors right away.
  const [hasEverFocused, setHasEverFocused] = useState(false);
  const [focused, setFocused] = useState(false);

  function onInputFocus(e: FocusEvent<HTMLTextAreaElement>) {
    setFocused(true);
    setHasEverFocused(true);
    onFocus?.(e);
  }

  function onInputBlur(e: FocusEvent<HTMLTextAreaElement>) {
    setFocused(false);
    onBlur?.(e);
  }

  // Mirror logic from <TextArea>.
  const showError = !!rest.error && (!!rest.value || hasEverFocused) && !focused;

  return (
    <StyledLabeledTextArea
      style={style}
      className={className}
      data-disabled={disabled}
      data-error={showError}
      data-new-style={newStyle}
    >
      {newStyle && label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <TextArea
        newStyle={newStyle}
        autoSizing={autoSizing}
        disabled={disabled}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        id={id}
        {...rest}
      />
      {label && !newStyle && <span className="label">{label}</span>}
      {children}
    </StyledLabeledTextArea>
  );
};

export const StyledLabeledTextArea = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  box-sizing: border-box;
  cursor: text;

  > ${StyledTextArea} {
    > textarea {
      /* If the textarea is empty or smaller than the available height,
         make it take up the full height so you can click anywhere to focus it. */
      min-height: 100%;
    }

    flex-grow: 1;
  }

  &[data-new-style="false"] {
    min-height: 60px;

    > ${StyledTextArea} {
      > textarea {
        padding: 30px 10px 8px;
      }
    }

    > .label {
      position: absolute;
      left: 10px;
      top: 10px;
      font: ${fonts.displayBold({ size: 11, line: "11px" })};
      color: ${colors.text()};
      letter-spacing: 1px;
      text-transform: uppercase;
      pointer-events: none;
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
  }
`;
