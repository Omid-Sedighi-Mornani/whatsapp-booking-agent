import { addMinutes, addSeconds, addHours, parse, format } from "date-fns";
import { DateTime } from "luxon";

export function addToTime(time_str, { seconds = 0, minutes = 0, hours = 0 }) {
  let dateObj = parse(time_str, "HH:mm", new Date());
  dateObj = addSeconds(dateObj, seconds);
  dateObj = addMinutes(dateObj, minutes);
  dateObj = addHours(dateObj, hours);

  return format(dateObj, "HH:mm");
}

export function toUTC(dateString, formatString = "yyyy-MM-dd'T'HH:mm") {
  const localDate = DateTime.fromFormat(dateString, formatString, {
    zone: "Europe/Berlin",
  });
  return localDate.toUTC().toISO();
}
