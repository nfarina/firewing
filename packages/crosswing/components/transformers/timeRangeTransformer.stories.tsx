import dayjs from "dayjs";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Button } from "../Button.js";
import { dateRange, formatDateRange } from "../forms/DateRange.js";
import { TextInput } from "../forms/TextInput.js";
import { useInputValue } from "../forms/useInputValue.js";
import { TransformerDecorator } from "./storybook.js";
import { timeRangeTransformer } from "./timeRangeTransformer.js";

export default {
  component: timeRangeTransformer, // Just for the title.
  decorators: [
    CrosswingAppDecorator({ layout: "component" }),
    TransformerDecorator,
    ModalDecorator,
  ],
  parameters: { layout: "centered" },
};

export const Default = () => {
  const range = useInputValue({
    transformer: timeRangeTransformer({ dateRange: dateRange() }),
  });

  return (
    <>
      <TextInput placeholder="Ex: 3-4pm" {...range.props} />
      <Button
        children="Reset Value to 12pm-2pm"
        onClick={() =>
          range.set({
            start: dayjs().set("hour", 12).set("minute", 0).valueOf(),
            end: dayjs().set("hour", 14).set("minute", 0).valueOf(),
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
