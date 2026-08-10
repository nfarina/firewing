import { action } from "storybook/actions";
import { ModalRootProvider } from "../context/ModalRootProvider.js";
import { DialogContainer } from "../dialog/useDialog.js";
import { SheetContainer } from "../sheet/useSheet.js";

/**
 * For Storybook; renders your story inside a <ModalRootProvider>.
 *
 * You may pass props to the ModalRootProvider by passing an object as the first
 * argument. Otherwise, you should use the decorator without calling it as
 * a function.
 */
export function ModalDecorator(
  StoryOrParams: (() => any) | Parameters<typeof ModalRootProvider>[0],
): any {
  if (typeof StoryOrParams === "function") {
    return <ModalRootProvider children={<StoryOrParams />} />;
  } else {
    return (Story: () => any) => <ModalRootProvider children={<Story />} {...StoryOrParams} />;
  }
}

/**
 * For Storybook; renders your story inside a <DialogContainer>.
 *
 * You may pass props to the DialogContainer by passing an object as the first
 * argument. Otherwise, you should use the decorator without calling it as
 * a function.
 */
export function DialogDecorator(
  StoryOrParams: (() => any) | Omit<Parameters<typeof DialogContainer>[0], "onClose" | "children">,
): any {
  if (typeof StoryOrParams === "function") {
    return <DialogContainer onClose={action("onClose")} children={<StoryOrParams />} />;
  } else {
    return (Story: () => any) => (
      <DialogContainer onClose={action("onClose")} children={<Story />} {...StoryOrParams} />
    );
  }
}

/**
 * For Storybook; renders your story inside a <SheetContainer>.
 *
 * You may pass props to the SheetContainer by passing an object as the first
 * argument. Otherwise, you should use the decorator without calling it as
 * a function.
 */
export function SheetDecorator(
  StoryOrParams: (() => any) | Omit<Parameters<typeof SheetContainer>[0], "onClose" | "children">,
): any {
  if (typeof StoryOrParams === "function") {
    return <SheetContainer onClose={action("onClose")} children={<StoryOrParams />} />;
  } else {
    return (Story: () => any) => (
      <SheetContainer onClose={action("onClose")} children={<Story />} {...StoryOrParams} />
    );
  }
}
