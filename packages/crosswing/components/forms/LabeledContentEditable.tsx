import {
  ClipboardEvent,
  FormEvent,
  HTMLAttributes,
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

/**
 * Like LabeledTextArea, but using a <div> with the contentEditable flag, so
 * the user can enter rich HTML text.
 */
export function LabeledContentEditable({
  label,
  placeholder,
  disabled,
  forceParagraphs,
  pasteTextOnly,
  value,
  onValueChange,
}: Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & {
  label?: ReactNode;
  placeholder?: ReactNode;
  disabled?: boolean;
  forceParagraphs?: boolean;
  pasteTextOnly?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!editorRef.current) return;
    if (forceParagraphs) {
      // Make it so when you press Return in the contentEditable div, it inserts
      // a new paragraph element instead of a <br/>.
      document.execCommand("defaultParagraphSeparator", false, "p");
    } else {
      // Make it so when you press Return in the contentEditable div, it inserts
      // a <br/> element instead of a new paragraph.
      document.execCommand("defaultParagraphSeparator", false, "div");
    }
  }, []);

  const emptyValue = forceParagraphs ? "<p><br></p>" : "";

  useLayoutEffect(() => {
    if (!editorRef.current) return; // Shouldn't happen.
    // Check for equality, otherwise the cursor position gets reset as
    // you type.
    const newValue = value || emptyValue;
    if (editorRef.current.innerHTML !== newValue) {
      editorRef.current.innerHTML = newValue;
    }
  }, [value]);

  function onDescriptionInput(e: FormEvent<HTMLDivElement>) {
    const editor = e.target as HTMLDivElement;
    const html = editor.innerHTML;
    onValueChange?.(html);
  }

  // Don't allow you to paste the HTML contents of the clipboard, becuase
  // it could contain all kinds of invisible crap - try copy/pasting from Figma
  // for example.
  // https://stackoverflow.com/a/12028136/66673
  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    if (!pasteTextOnly) return;

    // Stop data actually being pasted into div.
    e.stopPropagation();
    e.preventDefault();

    // Get text representation of clipboard.
    const text = e.clipboardData.getData("text/plain");

    // Insert text manually
    document.execCommand("insertHTML", false, text);
  }

  const isEmpty = !value || value === emptyValue;

  return (
    <StyledLabeledContentEditable
      data-disabled={!!disabled}
      data-empty={isEmpty}
      data-has-label={!!label}
    >
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        onInput={onDescriptionInput}
        onPaste={onPaste}
      />
      {isEmpty && (
        <div className="placeholder">
          {placeholder || (
            <>
              Enter a rich text description here. You can use standard hotkeys for <b>bold</b>,{" "}
              <i>italic</i>, etc.
            </>
          )}
        </div>
      )}
      {label && <span className="label">{label}</span>}
    </StyledLabeledContentEditable>
  );
}

export const StyledLabeledContentEditable = styled.div`
  min-height: 60px;
  position: relative;

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
  }

  > .editor {
    padding: 10px 10px 8px 10px; /* Trim bottom padding because of line-height. */
    font: ${fonts.display({ size: 16, line: "22px" })};
    color: ${colors.text()};
    outline: none;

    a {
      color: ${colors.text()};
    }

    > p:first-of-type {
      margin-top: 0;
    }

    > p:last-of-type {
      margin-bottom: 0;
    }
  }

  > .placeholder {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    padding: 10px 10px 8px 10px; /* Trim bottom padding because of line-height. */
    font: ${fonts.display({ size: 16, line: "22px" })};
    color: ${colors.text({ alpha: 0.4 })};
  }

  /** If we're rendering a placeholder, then make the placeholder determine
      the size of its parent, instead of the "editor". */
  &[data-empty="true"] {
    > .editor {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    > .placeholder {
      position: relative;
    }
  }

  &[data-has-label="true"] {
    > .editor,
    > .placeholder {
      padding: 30px 10px 8px; /* Trim bottom padding because of line-height. */
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > .label,
    > .editor,
    > .placeholder {
      opacity: 0.5;
    }
  }

  > .label,
  > .editor,
  > .placeholder {
    transition: opacity 0.2s ease-in-out;
  }
`;
