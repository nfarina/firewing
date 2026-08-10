import { ReactNode } from "react";
import { DateRange, isSameDay } from "../forms/DateRange.js";
import { Timestamp, TimestampFormatter } from "./Timestamp.js";

export function DateRangeLabel({
  range,
  format = "MMM D, YYYY",
  emptyText = null,
}: {
  range?: DateRange | null;
  format?: string | TimestampFormatter;
  emptyText?: ReactNode;
}) {
  if (range && range.start && !range.end) {
    return (
      <>
        <Timestamp date={range.start} format={format} />–
      </>
    );
  } else if (range && !range.start && range.end) {
    return (
      <>
        –<Timestamp date={range.end} format={format} />
      </>
    );
  } else if (range && range.start && range.end && isSameDay(range)) {
    return (
      <>
        <Timestamp date={range.start} format={format} />
      </>
    );
  } else if (range && range.start && range.end) {
    return (
      <>
        <Timestamp date={range.start} format={format} />–
        <Timestamp date={range.end} format={format} />
      </>
    );
  } else {
    return emptyText as any;
  }
}
