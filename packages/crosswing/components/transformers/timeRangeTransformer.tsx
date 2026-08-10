import dayjs from "dayjs";
import { DateRange } from "../forms/DateRange";
import { InputTransformer } from "../forms/useInputValue";

export function formatTimeRange(dateRange: DateRange | null): string | null {
  if (!dateRange) return "";
  const { start, end } = dateRange;

  const allDay =
    dayjs(start).isSame(dayjs(start).startOf("day")) && dayjs(end).isSame(dayjs(end).endOf("day"));

  if (allDay) {
    return null;
  }

  const startTime = dayjs(start).format("h:mm a");
  const endTime = dayjs(end).format("h:mm a");

  return `${startTime}–${endTime}`;
}

export function timeRangeTransformer({ dateRange }: { dateRange: DateRange | null }) {
  return {
    parse(text: string) {
      if (!dateRange) {
        return null; // No date in which to set ranges!
      }

      if (!text) {
        return null;
      }

      // Try to parse the text as a time range. Allows for text like
      // "11a - 1:30pm". Use a regex. Extract hours and minutes separately.
      const match = text.match(
        /^(\d{1,2})(?::(\d{1,2}))?(?:\s*(a|p)m?)?\s*(?:-|–|—)\s*(\d{1,2})(?::(\d{1,2}))?(?:\s*(a|p)m?)?$/i, // Thanks Copilot!
      );

      if (!match) {
        throw new Error("Could not parse time range");
      }

      let [, hours1, minutes1, ampm1, hours2, minutes2, ampm2] = match;

      // If ampm1 was specified but ampm2 was not, assume ampm2 is the same as
      // ampm1, and vice versa.
      if (ampm1 && !ampm2) {
        ampm2 = ampm1;
      } else if (!ampm1 && ampm2) {
        ampm1 = ampm2;
      }

      function getHour(hours: string, ampm: string | undefined) {
        let hour = parseInt(hours ?? "0");

        // Assume pm if not specified.
        let isPm = !ampm || ampm?.toLowerCase() === "p";

        if (hour === 12 && !isPm) {
          // If the user specified 12am, assume they meant 0am.
          hour = 0;
        } else if (hour === 12 && isPm) {
          // If the user specified 12pm, assume they meant 12pm.
          hour = 12;
        } else if (isPm) {
          // If the user specified a pm hour (or omitted it), assume pm and
          // add 12.
          hour += 12;
        }

        return hour;
      }

      const start = dayjs(dateRange.start)
        .set("hour", getHour(hours1, ampm1))
        .set("minute", parseInt(minutes1 ?? "0"))
        .set("second", 0)
        .set("millisecond", 0)
        .valueOf();

      let end = dayjs(dateRange.end)
        .set("hour", getHour(hours2, ampm2))
        .set("minute", parseInt(minutes2 ?? "0"))
        .set("second", 0)
        .set("millisecond", 0)
        .valueOf();

      // If the end time is before the start time, assume the end time is on the
      // next day.
      if (end < start) {
        end = dayjs(end).add(1, "day").valueOf();
      }

      return { start, end };
    },
    format: (range) => formatTimeRange(range) ?? "",
  } satisfies InputTransformer<DateRange | null>;
}
