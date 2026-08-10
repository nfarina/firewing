import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utcPlugin from "dayjs/plugin/utc.js";
import { InputTransformer } from "../forms/useInputValue";

dayjs.extend(utcPlugin);
dayjs.extend(customParseFormat);

/**
 * Works with dates in a known format, optionally in UTC.
 *
 * NOTE: When considering the resulting value, remember that `0` is a valid
 * date (1/1/1970) so don't just do a `!!value` type of check to see if the
 * user has entered a value.
 */
export function dateTransformer({
  formats = ["M/D/YYYY", "M/D/YY"],
  utc,
}: {
  formats?: string[];
  utc?: boolean;
} = {}): InputTransformer<number> {
  return {
    parse(text: string) {
      if (!text) {
        return null;
      }

      let date: Dayjs | null = null;

      for (const format of formats) {
        const maybeDate = utc ? dayjs.utc(text, format) : dayjs(text, format);

        if (maybeDate.isValid()) {
          date = maybeDate;
          break;
        }
      }

      // Still invalid?
      if (!date) {
        throw new Error("Invalid date");
      }

      return date.valueOf();
    },
    format(value: number | null) {
      if (value === null) return "";

      // Use the first format in the list, or a fallback.
      const format = formats[0] ?? "M/D/YYYY";

      return utc ? dayjs.utc(value).format(format) : dayjs(value).format(format);
    },
  };
}
