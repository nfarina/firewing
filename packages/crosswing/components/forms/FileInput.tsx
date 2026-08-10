import { ChangeEvent, DragEvent, DragEventHandler, HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { useDragEvents } from "../../hooks/useDragEvents";

export function FileInput({
  accept,
  onDragOverChange,
  onDrop,
  onFileSelect,
  onFileListSelect,
  multiple,
  disabled,
  children,
  ...rest
}: {
  accept?: string;
  onDragOverChange?: (over: boolean) => void;
  onFileSelect?: (file: File) => void;
  onFileListSelect?: (list: FileList) => void;
  multiple?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  onDrop?: DragEventHandler<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>) {
  const dragEvents = useDragEvents({
    onDragOverChange,
    onDrop: onDrop as ((e: DragEvent) => void) | undefined,
    disabled,
  });

  if (onFileListSelect && !multiple) {
    console.warn("FileInput: onFileListSelect is set but multiple is false");
  } else if (onFileSelect && multiple) {
    console.warn("FileInput: onFileSelect is set but multiple is true");
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;

    if (multiple) {
      const files = input.files;
      if (!files) return;

      onFileListSelect?.(files);
    } else {
      const file = input.files?.[0];
      if (!file) return;

      onFileSelect?.(file);
    }

    // Clear the input in case you want to select the exact same file again.
    input.value = ""; // clears the "files" property.
  }

  return (
    <StyledFileInput data-disabled={disabled} {...dragEvents} {...rest}>
      {children}
      <input
        type="file"
        size={0}
        onChange={onFileChange}
        multiple={multiple}
        accept={accept}
        // Hides the "No files chosen" tooltip in Chrome.
        title=""
      />
    </StyledFileInput>
  );
}

export const StyledFileInput = styled.div`
  position: relative;

  > input[type="file"] {
    appearance: none;
    opacity: 0; /* Necessary for older iOS versions. */
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    cursor: pointer;
    color: transparent;
    /* Necessary to hide the tooltip in Safari. But it breaks the input! */
    /* visibility: hidden; */
  }

  &[data-dragging-over="true"] {
    > input[type="file"] {
      /* Must make it visible again to accept drops. */
      visibility: visible;
    }
  }

  > input[type="file"]::-webkit-file-upload-button,
  > input[type="file"]::file-selector-button {
    display: none;
  }

  &[data-disabled="true"] {
    > input[type="file"] {
      pointer-events: none;
      cursor: default;
    }
  }
`;
