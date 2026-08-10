import { Meta } from "@storybook/react";
import { useState } from "react";
import { ModalDecorator } from "../../modals/storybook/decorators.js";
import { Days } from "../../shared/timespan.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SeparatorDecorator } from "../SeparatorLayout.js";
import { DateRange, dateRange } from "./DateRange.js";
import { LabeledDateRangeInput } from "./LabeledDateRangeInput.js";

export default {
  component: LabeledDateRangeInput,
  decorators: [SeparatorDecorator, ModalDecorator, CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LabeledDateRangeInput>;

export const Empty = () => {
  const [date, setDate] = useState<DateRange | null>(null);

  return (
    <LabeledDateRangeInput
      style={{ marginTop: "50px" }}
      label="Date Range"
      value={date}
      onValueChange={setDate}
    />
  );
};

export const DefaultValue = () => {
  const [date, setDate] = useState<DateRange | null>(
    dateRange(Date.now() - Days(7), Date.now() - Days(2)),
  );

  return (
    <LabeledDateRangeInput
      style={{ marginTop: "50px" }}
      label="Date Range"
      value={date}
      onValueChange={setDate}
    />
  );
};
