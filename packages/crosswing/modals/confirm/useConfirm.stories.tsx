import { action } from "storybook/actions";
import { styled } from "styled-components";
import { Button } from "../../components/Button.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useConfirm } from "./useConfirm.js";

export default {
  component: useConfirm,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator],
  parameters: { layout: "fullscreen" },
};

export function Normal() {
  const confirm = useConfirm(() => ({
    title: "Skin cat?",
    message: "Are you sure you want to skin the cat this particular way?",
    destructiveText: "Skin it",
    onConfirm: () => action("skinned")(),
  }));

  return (
    <ButtonContainer>
      <Button newStyle bordered onClick={confirm.show} children="Skin cat" />
    </ButtonContainer>
  );
}

export function SubtitleOnly() {
  const confirm = useConfirm(() => ({
    message: "Really skin the cat?",
    onConfirm: () => action("skinned")(),
  }));

  return (
    <ButtonContainer>
      <Button newStyle bordered onClick={confirm.show} children="Skin cat" />
    </ButtonContainer>
  );
}

const ButtonContainer = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  > * + * {
    margin-top: 10px;
  }
`;
