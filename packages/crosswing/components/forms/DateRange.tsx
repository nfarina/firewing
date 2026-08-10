import dayjs from "dayjs";

/** An exact range of defined timestamps. */
export type DateRange = {
  start: number;
  end: number;
};

/** A more permissive range that can be open-ended. */
export type OpenDateRange = {
  start?: number | null | undefined;
  end?: number | null | undefined;
};

export function dateRange(start?: number | null, end?: number | null): DateRange {
  if (start == null) {
    // Today.
    return {
      start: dayjs().startOf("day").valueOf(),
      end: dayjs().endOf("day").valueOf(),
    };
  } else if (end == null) {
    // The day that `start` is contained in.
    return {
      start: dayjs(start).startOf("day").valueOf(),
      end: dayjs(start).endOf("day").valueOf(),
    };
  } else {
    // The exact range specified.
    return { start, end };
  }
}

/** Meant for debugging only. */
export function formatDateRange(range: OpenDateRange | DateRange | null): string {
  const start = range?.start ? dayjs(range.start).format("MMM D, YYYY h:mm a") : "<none>";
  const end = range?.end ? dayjs(range.end).format("MMM D, YYYY h:mm a") : "<none>";

  if (start === "<none>" && end === "<none>") {
    return "<empty range>";
  } else if (start === end) {
    return start;
  } else if (start === "<none>") {
    return `Until ${end}`;
  } else if (end === "<none>") {
    return `Since ${start}`;
  } else {
    return `${start} – ${end}`;
  }
}

export function isDateInRange(date: number, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function areDateRangesEqual(
  range1: DateRange | null | undefined,
  range2: DateRange | null | undefined,
): boolean {
  if (range1 == null && range2 == null) {
    return true;
  } else if (range1 == null || range2 == null) {
    return false;
  } else {
    return range1.start === range2.start && range1.end === range2.end;
  }
}

/**
 * Returns true if the start and end date in the given range occur in the same
 * day.
 */
export function isSameDay(range: DateRange): boolean {
  return dayjs(range.start).isSame(dayjs(range.end), "day");
}

/**
 * Returns true if the given range covers one or more whole days (from midnight
 * in the morning on the start date to the millisecond before midnight in the
 * evening on the end date).
 */
export function isAllDay(range: DateRange): boolean {
  return (
    range.start === dayjs(range.start).startOf("day").valueOf() &&
    range.end === dayjs(range.end).endOf("day").valueOf()
  );
}

export function makeAllDay(range: DateRange): DateRange {
  return {
    start: dayjs(range.start).startOf("day").valueOf(),
    end: dayjs(range.end).endOf("day").valueOf(),
  };
}

export function getAlgoliaFilter(field: string, { start, end }: DateRange): string {
  return `${field}:${start} TO ${end}`;
}

//
// Presets for ranges, for date pickers.
//

export interface DateRangePreset {
  title: string;
  range: () => DateRange;
}

export const AllDateRangePresets: DateRangePreset[] = [
  {
    title: "Today",
    range: () => ({
      start: dayjs().startOf("day").valueOf(),
      end: dayjs().endOf("day").valueOf(),
    }),
  },
  {
    title: "Yesterday",
    range: () => ({
      start: dayjs().subtract(1, "day").startOf("day").valueOf(),
      end: dayjs().subtract(1, "day").endOf("day").valueOf(),
    }),
  },
  {
    title: "This Week",
    range: () => ({
      start: dayjs().startOf("week").valueOf(),
      end: dayjs().endOf("week").valueOf(),
    }),
  },
  {
    title: "Last Week",
    range: () => ({
      start: dayjs().subtract(1, "week").startOf("week").valueOf(),
      end: dayjs().subtract(1, "week").endOf("week").valueOf(),
    }),
  },
  {
    title: "This Month",
    range: () => ({
      start: dayjs().startOf("month").valueOf(),
      end: dayjs().endOf("month").valueOf(),
    }),
  },
  {
    title: "Last Month",
    range: () => ({
      start: dayjs().subtract(1, "month").startOf("month").valueOf(),
      end: dayjs().subtract(1, "month").endOf("month").valueOf(),
    }),
  },
  {
    title: "This Year",
    range: () => ({
      start: dayjs().startOf("year").valueOf(),
      end: dayjs().endOf("year").valueOf(),
    }),
  },
  {
    title: "Last Year",
    range: () => ({
      start: dayjs().subtract(1, "year").startOf("year").valueOf(),
      end: dayjs().subtract(1, "year").endOf("year").valueOf(),
    }),
  },
];
