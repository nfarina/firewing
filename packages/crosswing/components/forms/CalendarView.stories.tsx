import dayjs from "dayjs";
import { useState } from "react";
import { styled } from "styled-components";
import { CrosswingAppDecorator } from "../../storybook.js";
import { CalendarView } from "./CalendarView.js";
import { areDateRangesEqual, DateRange, dateRange, isSameDay } from "./DateRange.js";

export default {
  component: CalendarView,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
};

export const NoSelection = () => <PaddedCalendarView />;

export const SingleDateSelected = () => <PaddedCalendarView selectedRange={dateRange()} />;

export const SingleDatePicker = () => {
  // Build a simple single-day picker.
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <PaddedCalendarView selectedRange={range} onDateClick={(date) => setRange(dateRange(date))} />
  );
};

export const DateRangeSelected = () => (
  <PaddedCalendarView
    selectedRange={dateRange(
      dayjs().subtract(2, "days").startOf("day").valueOf(),
      dayjs().subtract(-2, "days").endOf("day").valueOf(), // Storybook doesn't like functions called add() because of legacy story formats.
    )}
  />
);

export const DateRangePicker = () => {
  // Build a simple date range picker.
  const [range, setRange] = useState<DateRange | null>(null);

  // Copied from DateRangeInput.
  function onCalendarDateClick(date: number) {
    const clickedRange = dateRange(date);

    // If you clicked the a single date that is already selected,
    // deselect the range.
    if (areDateRangesEqual(clickedRange, range)) {
      setRange(null);
    }
    // If you clicked a date after the one that's selected, and the existing
    // range is just one day, then extend the range.
    else if (range && isSameDay(range) && clickedRange.start > range.end) {
      setRange(dateRange(range.start, clickedRange.start));
    }
    // Just select the exact range you selected.
    else {
      setRange(clickedRange);
    }
  }

  return <PaddedCalendarView selectedRange={range} onDateClick={onCalendarDateClick} />;
};

const PaddedCalendarView = styled(CalendarView)`
  padding: 0 10px;
`;
