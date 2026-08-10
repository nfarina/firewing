import dayjs from "dayjs";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { formatDateRange } from "../forms/DateRange.js";
import { TextInput } from "../forms/TextInput.js";
import { useInputValue } from "../forms/useInputValue.js";
import { dateRangeTransformer } from "./dateRangeTransformer.js";
import { TransformerDecorator } from "./storybook.js";

export default {
  component: dateRangeTransformer, // Just for the title.
  decorators: [
    CrosswingAppDecorator({ layout: "component" }),
    TransformerDecorator,
    ModalDecorator,
  ],
  parameters: { layout: "centered" },
};

export const Default = () => {
  const range = useInputValue({
    transformer: dateRangeTransformer(),
  });

  return (
    <>
      <TextInput placeholder="Ex: 2/1/2020 - 2/15/2020" {...range.props} />
      <Button
        children="Reset Value to 1/1/1980 - 2/15/1980"
        onClick={() =>
          range.set({
            start: dayjs("1/1/1980Z").valueOf(),
            end: dayjs("2/15/1980Z").valueOf(),
          })
        }
      />
      <pre>
        Parsed: {JSON.stringify(range.value)}
        <br />({formatDateRange(range.value)})<br />
        Error: {range.error?.message ?? ""}
      </pre>
    </>
  );
};
