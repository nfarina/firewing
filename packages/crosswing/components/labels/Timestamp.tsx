import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { HTMLAttributes, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { capitalize } from "../../shared/strings.js";

dayjs.extend(calendar);
dayjs.extend(utc);
dayjs.extend(timezone);

export type TimestampFormatter = (timestamp: number, timezone?: string) => string;
export type FormatString = string;

export function formatTimestamp(
  date: Date | number,
  timezone: string | undefined,
  formatter: TimestampFormatter | FormatString | undefined | null,
): string {
  const timestamp = typeof date === "number" ? date : date.getTime();

  if (formatter) {
    if (typeof formatter === "string") {
      return dayjs.tz(timestamp, timezone).format(formatter);
    } else {
      return formatter(timestamp, timezone);
    }
  } else {
    // Default format.
    return capitalize(
      dayjs.tz(date, timezone).calendar(undefined, {
        sameDay: "[today] [at] h:mm a",
        nextDay: "[tomorrow at] h:mm a",
        nextWeek: "M/D/YYYY [at] h:mm a",
        lastDay: "[yesterday at] h:mm a",
        lastWeek: "M/D/YYYY [at] h:mm a",
        sameElse: "M/D/YYYY [at] h:mm a",
      }),
    );
  }
}

export function Timestamp({
  date,
  timezone = undefined,
  format: formatter,
  lowercase,
  static: isStatic = false,
  ...rest
}: {
  date: Date | number;
  timezone?: string;
  format?: TimestampFormatter | FormatString;
  lowercase?: boolean;
  /** If true, the timestamp will not auto-update when the date changes. */
  static?: boolean;
} & HTMLAttributes<HTMLSpanElement>) {
  const ref = useRef<HTMLSpanElement>(null);

  // Get a number we can use as a dependency for useEffect().
  const timestamp = typeof date === "number" ? date : date.getTime();

  useEffect(() => {
    if (isStatic) return;

    function updateDOM() {
      const span = ref.current;
      if (span) span.innerText = getText();
    }

    addTimestampListener(updateDOM);
    return () => removeTimestampListener(updateDOM);
  }, [timestamp, formatter, dayjs, lowercase, isStatic]);

  function getText(): string {
    const text = formatTimestamp(timestamp, timezone, formatter);
    return lowercase ? text.toLowerCase() : text;
  }

  return <StyledTimestamp ref={ref} children={getText()} {...rest} />;
}

export const StyledTimestamp = styled.span``;

//
// Layout queue
//

// We implement a simple update queue here instead of relying on setState and
// react, in order to avoid layout thrashing. Since all Timestamp elements on
// the page can safely be updated at the same time, it makes no sense to have
// a million separate timers and re-renders for each one. Additionally, the
// DOM content of the Timestamp can be updated directly without React even being
// involved.

type UpdateFunc = () => void;

const listeners: Set<UpdateFunc> = new Set();
let intervalID: number | null = null;

// Can be changed globally, for instance in Storybook to demonstrate live updates.
let updateInterval = 60000;

export function setTimestampUpdateInterval(interval: number) {
  updateInterval = interval;
}

function addTimestampListener(timestamp: UpdateFunc) {
  listeners.add(timestamp);

  // If we didn't have a timer before, we'll need one now.
  if (intervalID === null) {
    intervalID = window.setInterval(updateTimestamps, updateInterval);
  }
}

function removeTimestampListener(timestamp: UpdateFunc) {
  listeners.delete(timestamp);

  if (listeners.size === 0 && intervalID !== null) {
    window.clearInterval(intervalID);
    intervalID = null;
  }
}

function updateTimestamps() {
  // console.log(`Processing update queue with ${listeners.size} timestamps.`);

  // performance.mark('updateTimestamps-start');

  for (const updateFunc of listeners) {
    updateFunc();
  }

  // performance.mark('updateTimestamps-end');
  // performance.measure('updateTimestamps', 'updateTimestamps-start', 'updateTimestamps-end');
}
