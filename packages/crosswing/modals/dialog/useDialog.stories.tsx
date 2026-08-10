import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { DialogView } from "./DialogView.js";
import { useDialog } from "./useDialog.js";

export default {
  component: useDialog,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const dialog = useDialog(() => (
    <DialogView
      title="Normal dialog"
      onClose={dialog.hide}
      buttons={[{ primary: true, title: "Close", onClick: dialog.hide }]}
    >
      This is a normal dialog.
    </DialogView>
  ));

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={dialog.show}>Show dialog</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function LongContent() {
  const dialog = useDialog(() => (
    <DialogView
      title="Dialog with long content"
      onClose={dialog.hide}
      buttons={[{ title: "Close", onClick: dialog.hide }]}
    >
      <p>This dialog has a lot of content to demonstrate scrolling.</p>
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris.
        </p>
      ))}
    </DialogView>
  ));

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={dialog.show}>Show dialog</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function CustomDialog() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);

  // Create a dialog that demonstrates how dialogs can have their own state like
  // any other react component, but also update in response to prop changes
  // over time.
  const dialog = useDialog((created: number) => (
    <StatefulDialog
      created={created}
      count={count}
      increment={increment}
      onAlert={alert.show}
      onClose={dialog.hide}
    />
  ));

  const alert = useDialog(() => <SampleDialog>This should be on top!</SampleDialog>);

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => dialog.show(Date.now())}>Show dialog</ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function CustomSticky() {
  const dialog = useDialog(
    () => (
      <SampleDialog>
        <div>This cannot be closed unless you click the button.</div>
        <ModalStoryButton onClick={dialog.hide} children="Close" />
      </SampleDialog>
    ),
    { sticky: true },
  );

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={dialog.show}>Show sticky dialog</ModalStoryButton>
    </ModalStoryButtons>
  );
}

//
// Components
//

function StatefulDialog({
  created,
  count,
  increment,
  onAlert,
  onClose,
}: {
  created: number;
  count: number;
  increment: () => void;
  onAlert: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(0);
  const incrementLocal = () => setLocal((c) => c + 1);

  return (
    <SampleDialog>
      <div>Dialog created {new Date(created).toString()}</div>
      <div>
        Host count is {count}, local count is {local}
      </div>
      <ModalStoryButton onClick={increment}>Increment Host</ModalStoryButton>
      <ModalStoryButton onClick={incrementLocal}>Increment Local</ModalStoryButton>
      <ModalStoryButton onClick={onAlert}>Show Alert</ModalStoryButton>
      <ModalStoryButton onClick={onClose}>Close</ModalStoryButton>
    </SampleDialog>
  );
}

//
// Styles
//

const SampleDialog = styled.div`
  display: flex;
  flex-flow: column;
  background: ${colors.textBackground()};
  color: ${colors.text()};
  padding: 20px;
  border-radius: 6px;
  font: ${fonts.display({ size: 14, line: "1.3" })};

  > * + * {
    margin-top: 10px;
  }
`;
