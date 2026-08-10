import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  UIEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useScrollSpeed } from "../../hooks/useScrollSpeed.js";
import { DateRange, isDateInRange, isSameDay } from "./DateRange.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const MONTH_HEADER_HEIGHT = 60;
const WEEK_HEIGHT = 42;
const START_YEAR = 1980;
const END_YEAR = 2050;

export function CalendarView({
  selectedRange,
  onDateClick,
  onMonthClick,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  selectedRange?: DateRange | null;
  onDateClick?: (date: number) => void;
  onMonthClick?: (date: number) => void;
}) {
  const containerRef = useRef<HTMLTableElement | null>(null);

  const [topVisibleMonth, setTopVisibleMonth] = useState(
    dayjs(selectedRange?.start || undefined).startOf("month"),
  );

  useLayoutEffect(() => {
    // When mounted in Storybook, our rects will be 0,0,0,0, so we need to wait a tic.
    requestAnimationFrame(() => {
      // Scroll to the start date on initial load.
      const container = containerRef.current;
      if (!container) return;

      // Scroll to now if startDate is empty.
      const targetPosition = getMonthPosition(
        dayjs(selectedRange?.start || undefined).startOf("month"),
      );

      // Scroll to the target position.
      container.scrollTop = targetPosition;
    });
  }, []);

  const scrollSpeed = useScrollSpeed();

  function onScroll(e: UIEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;

    // Get the month that is at the top of the scroll view.
    const topMonth = getMonthAtPosition(container.scrollTop);
    if (!topMonth) return;

    // If the top month changed, update our state.
    if (!topMonth.isSame(topVisibleMonth, "month")) {
      setTopVisibleMonth(topMonth);
    }

    // Pass along the scroll event to our scroll speed hook.
    scrollSpeed.onScroll(e);
  }

  function renderVisibleMonths(): ReactNode[] {
    const fromDate = topVisibleMonth.subtract(2, "months").startOf("month");
    const toDate = topVisibleMonth.add(4, "months").endOf("month");

    const months: ReactNode[] = [];
    let currentDate = fromDate;
    while (currentDate.isSameOrBefore(toDate)) {
      months.push(renderMonth(currentDate));
      currentDate = currentDate.add(1, "month");
    }
    return months;
  }

  function renderMonth(date: dayjs.Dayjs): ReactNode {
    const weeks: ReactNode[] = [];

    // Get the first and last day of this month.
    const firstDay = date.startOf("month");
    const lastDay = date.endOf("month");

    let currentDay = firstDay;

    while (currentDay.startOf("week").isSameOrBefore(lastDay)) {
      weeks.push(renderWeek(currentDay.startOf("week"), firstDay));
      currentDay = currentDay.add(1, "week");
    }

    const cssProps: CSSProperties & { "--position": string } = {
      ["--position"]: getMonthPosition(date) + "px",
    };

    return (
      <div
        className="month"
        key={date.format("YYYY-MM")}
        data-month={date.toISOString()}
        data-show-month-overlay={scrollSpeed.isScrollingFast}
        style={cssProps}
      >
        <div
          className="month-name"
          data-is-month-clickable={!!onMonthClick}
          onClick={onMonthClick ? () => onMonthClick(date.valueOf()) : undefined}
        >
          {date.format("MMMM YYYY")}
        </div>
        {weeks}
        <div className="month-overlay">
          {date.format(date.year() === dayjs().year() ? "MMMM" : "MMMM YYYY")}
        </div>
      </div>
    );
  }

  function renderWeek(date: dayjs.Dayjs, month: dayjs.Dayjs): ReactNode {
    const days: ReactNode[] = [];

    const firstDay = month.startOf("month");
    const lastDay = month.endOf("month");

    // Render the days of the week.
    for (let i = 0; i < 7; i++) {
      const day = date.add(i, "day");

      // Render an invisible cell if the day is not in this month.
      if (day.isBefore(firstDay) || day.isAfter(lastDay)) {
        days.push(
          <div
            data-date={date.valueOf()}
            data-day={day.valueOf()}
            data-is-before={day.isBefore(firstDay) && firstDay.valueOf()}
            data-is-after={day.isAfter(lastDay) && lastDay.valueOf()}
            key={day.format("YYYY-MM-DD")}
          />,
        );
      } else {
        days.push(renderDay(day));
      }
    }

    return (
      <div className="week" key={date.format("YYYY-MM-DD")}>
        {days}
      </div>
    );
  }

  function renderDay(date: dayjs.Dayjs): ReactNode {
    const isInsideRange =
      selectedRange && !isSameDay(selectedRange) && isDateInRange(date.valueOf(), selectedRange);

    const isRangeEndcap =
      selectedRange &&
      (date.isSame(selectedRange.start, "day") || date.isSame(selectedRange.end, "day"));

    const isRangeStart = !!selectedRange && date.isSame(selectedRange.start, "day");
    const isRangeEnd = !!selectedRange && date.isSame(selectedRange.end, "day");

    return (
      <div
        key={date.format("YYYY-MM-DD")}
        className="day"
        onClick={() => onDateClick?.(date.valueOf())}
        data-is-today={date.isSame(dayjs(), "day")}
        data-is-inside-range={!!isInsideRange}
        data-is-range-endcap={!!isRangeEndcap}
        data-is-range-start={!!isRangeStart}
        data-is-range-end={!!isRangeEnd}
      >
        <div className="range-inner" />
        <div className="range-endcap" />
        <div className="number">{date.format("D")}</div>
      </div>
    );
  }

  return (
    <StyledCalendarView {...rest}>
      <div className="header">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      <div className="container" ref={containerRef} onScroll={onScroll}>
        <div className="months">{renderVisibleMonths()}</div>
      </div>
    </StyledCalendarView>
  );
}

export const StyledCalendarView = styled.div`
  background: ${colors.textBackground()};
  display: flex;
  flex-flow: column;

  > .header {
    flex-shrink: 0;
    height: 45px;
    background: ${colors.textBackground()};
    display: flex;
    flex-flow: row;
    align-items: flex-end;

    > div {
      width: 0;
      flex-grow: 1;
      box-sizing: border-box;
      text-align: center;
      font: ${fonts.displayMedium({ size: 13 })};
      color: ${colors.textSecondary()};
      padding-bottom: 10px;
    }
  }

  > .container {
    height: 0;
    flex-grow: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    > .months {
      flex-shrink: 0;
      position: relative;
      height: 999999px;

      > .month {
        position: absolute;
        width: 100%;
        top: var(--position);

        > .month-name {
          height: ${MONTH_HEADER_HEIGHT}px;
          padding: 0 10px 10px;
          box-sizing: border-box;
          display: flex;
          flex-flow: column;
          justify-content: flex-end;
          align-items: flex-start;
          font: ${fonts.displayBold({ size: 17 })};
          color: ${colors.text()};

          &[data-is-month-clickable="true"] {
            cursor: pointer;
          }
        }

        > .week {
          display: flex;
          flex-flow: row;
          height: ${WEEK_HEIGHT}px;

          > * {
            width: 0;
            flex-grow: 1;
          }

          > .day {
            cursor: pointer;
            position: relative;

            > .range-inner {
              position: absolute;
              top: 3px;
              left: 3px;
              width: calc(100% - 6px);
              height: calc(100% - 6px);
            }

            > .range-endcap {
              position: absolute;
              top: 3px;
              left: calc(50% - (42px - 6px) / 2);
              width: calc(42px - 6px);
              height: calc(100% - 6px);
            }

            &[data-is-inside-range="true"] > .range-inner {
              left: 0;
              width: 100%;
              background: ${colors.text({ alpha: 0.1 })};
              z-index: 1;
            }

            &[data-is-range-endcap="true"] > .range-endcap {
              background: ${colors.text()};
              border-radius: 9999px;
              z-index: 2;
            }

            &:first-of-type > .range-inner {
              border-top-left-radius: 6px;
              border-bottom-left-radius: 6px;
            }

            &:last-of-type > .range-inner {
              border-top-right-radius: 6px;
              border-bottom-right-radius: 6px;
            }

            &[data-is-range-start="true"] > .range-inner {
              left: 50%;
              width: 50%;
            }

            &[data-is-range-end="true"] > .range-inner {
              border-top-right-radius: 100%;
              border-bottom-right-radius: 100%;
              right: 50%;
              width: 50%;
            }

            > .number {
              position: relative;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 5px;
              box-sizing: border-box;
              min-height: 42px;
              width: 42px;
              font: ${fonts.displayMedium({ size: 15, line: "1" })};
              color: ${colors.text()};
              z-index: 3;
            }

            &[data-is-today="true"] {
              > .number {
                color: ${colors.primary()};
              }
            }

            &[data-is-range-endcap="true"] {
              > .number {
                color: ${colors.textBackground()};
              }
            }
          }
        }

        > .month-overlay {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font: ${fonts.displayBold({ size: 26 })};
          color: ${colors.text()};
          background: ${colors.textBackground({ alpha: 0.75 })};
          transition: opacity 0.2s;
          pointer-events: none;
          z-index: 10; /* Get above the days. */
        }

        &[data-show-month-overlay="true"] > .month-overlay {
          opacity: 1;
        }
      }
    }
  }
`;

/**
 * Imagining a calendar that begins on START_DATE and is rendered on a giant
 * <div>, this returns the Y coordinate of the given month.
 */
function getMonthPosition(date: dayjs.Dayjs): number {
  let pos = 0;

  const year = date.year();
  const month = date.month();

  for (let i = START_YEAR; i < year; i++) {
    pos += getYearHeight(dayjs().year(i));
  }

  for (let i = 0; i < month; i++) {
    pos += getMonthHeight(dayjs().year(year).month(i));
  }

  return pos;
}

/**
 * Imagining that same calendar, given a Y coordinate on that giant <div>,
 * returns the month that is rendered at that position.
 */
function getMonthAtPosition(y: number): dayjs.Dayjs | null {
  let pos = 0;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const yearHeight = getYearHeight(dayjs().year(year));
    if (y < pos + yearHeight) {
      for (let month = 0; month < 12; month++) {
        const monthHeight = getMonthHeight(dayjs().year(year).month(month));
        if (y < pos + monthHeight) {
          return dayjs().year(year).month(month).startOf("month");
        }
        pos += monthHeight;
      }
    }
    pos += yearHeight;
  }

  return null;
}

function getYearHeight(date: dayjs.Dayjs): number {
  const weeksInYear = weeksInYearCache[date.year()];
  return MONTH_HEADER_HEIGHT * 12 + weeksInYear * WEEK_HEIGHT;
}

/** Get the height of the month in pixels, when rendered. */
function getMonthHeight(date: dayjs.Dayjs): number {
  const weeksInMonth = getWeeksInMonth(date);
  return MONTH_HEADER_HEIGHT + weeksInMonth * WEEK_HEIGHT;
}

/**
 * Gets the number of weeks in a month, but only if the weeks are displayed in
 * the same way as they are in our calendar. So for instance, the 31st of July
 * might be displayed twice - once as the last week in July, and once as the
 * first week in August. In that case, this function would return 2 weeks for
 * this single conceptual week.
 */
function getWeeksInMonth(date: dayjs.Dayjs): number {
  const weekStart = date.startOf("month").week();
  const weekEnd = date.endOf("month").week();

  // If the month starts in the last week of the previous year, then we need to
  // subtract that week.
  if (weekStart > weekEnd) {
    const penultimateWeekEnd = date.endOf("month").subtract(1, "week").week();
    return penultimateWeekEnd - weekStart + 2;
  } else {
    return weekEnd - weekStart + 1;
  }
}

/**
 * This gets the number of weeks in a year, if the weeks are displayed in the
 * same way as they are in our calendar, as described in the comment for
 * getWeeksInMonth.
 */
function getWeeksInYear(date: dayjs.Dayjs): number {
  let totalWeeks = 0;
  const firstDay = date.startOf("year");

  for (let i = 0; i < 12; i++) {
    const month = firstDay.add(i, "month");
    totalWeeks += getWeeksInMonth(month);
  }

  return totalWeeks;
}

function getWeeksInYearCache(): Record<number, number> {
  const cache: Record<number, number> = {};

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const date = dayjs().year(year);
    cache[year] = getWeeksInYear(date);
  }

  return cache;
}

// Generated by commenting this out then looking at the console:
// console.log(getWeeksInYearCache());
const weeksInYearCache = {
  "1980": 63,
  "1981": 61,
  "1982": 63,
  "1983": 63,
  "1984": 62,
  "1985": 62,
  "1986": 63,
  "1987": 61,
  "1988": 63,
  "1989": 63,
  "1990": 62,
  "1991": 62,
  "1992": 62,
  "1993": 63,
  "1994": 63,
  "1995": 63,
  "1996": 62,
  "1997": 63,
  "1998": 61,
  "1999": 63,
  "2000": 64,
  "2001": 62,
  "2002": 62,
  "2003": 63,
  "2004": 62,
  "2005": 63,
  "2006": 63,
  "2007": 62,
  "2008": 63,
  "2009": 61,
  "2010": 63,
  "2011": 63,
  "2012": 62,
  "2013": 62,
  "2014": 63,
  "2015": 61,
  "2016": 63,
  "2017": 63,
  "2018": 62,
  "2019": 62,
  "2020": 62,
  "2021": 63,
  "2022": 63,
  "2023": 63,
  "2024": 62,
  "2025": 63,
  "2026": 61,
  "2027": 63,
  "2028": 64,
  "2029": 62,
  "2030": 62,
  "2031": 63,
  "2032": 62,
  "2033": 63,
  "2034": 63,
  "2035": 62,
  "2036": 63,
  "2037": 61,
  "2038": 63,
  "2039": 63,
  "2040": 62,
  "2041": 62,
  "2042": 63,
  "2043": 61,
  "2044": 63,
  "2045": 63,
  "2046": 62,
  "2047": 62,
  "2048": 62,
  "2049": 63,
  "2050": 63,
};
