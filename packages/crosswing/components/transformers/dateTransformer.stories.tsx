import dayjs from "dayjs";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { TextInput } from "../forms/TextInput.js";
import { useInputValue } from "../forms/useInputValue.js";
import { dateTransformer } from "./dateTransformer.js";
import { TransformerDecorator } from "./storybook.js";

export default {
  component: dateTransformer, // Just for the title.
  decorators: [
    CrosswingAppDecorator({ layout: "component" }),
    TransformerDecorator,
    ModalDecorator,
  ],
  parameters: { layout: "centered" },
};

export const Default = () => {
  const date = useInputValue({
    transformer: dateTransformer(),
  });

  return (
    <>
      <TextInput placeholder="Ex: 12/1/1979" {...date.props} />
      <Button
        children="Reset Value to 1/1/1980"
        onClick={() => date.set(dayjs("1/1/1980Z").valueOf())}
      />
      <pre>{`Parsed: ${date.value} (${date.value ? dayjs(date.value).format("M/D/YYYY") : ""}) - Error: ${date.error?.message ?? ""}`}</pre>
    </>
  );
};
