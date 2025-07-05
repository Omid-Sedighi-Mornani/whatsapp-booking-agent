import {
  addMinutes,
  addSeconds,
  addHours,
  parse,
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  parseISO,
} from "date-fns";
import { DateTime } from "luxon";

export function addToTime(time_str, { seconds = 0, minutes = 0, hours = 0 }) {
  let dateObj = parse(time_str, "HH:mm", new Date());
  dateObj = addSeconds(dateObj, seconds);
  dateObj = addMinutes(dateObj, minutes);
  dateObj = addHours(dateObj, hours);

  return format(dateObj, "HH:mm");
}

export function addToDateTime(
  date,
  {
    seconds = 0,
    minutes = 0,
    hours = 0,
    days = 0,
    weeks = 0,
    months = 0,
    years = 0,
  }
) {
  let dateObj;

  if (!(date instanceof Date)) {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  dateObj = addSeconds(dateObj, seconds);
  dateObj = addMinutes(dateObj, minutes);
  dateObj = addHours(dateObj, hours);
  dateObj = addDays(dateObj, days);
  dateObj = addWeeks(dateObj, weeks);
  dateObj = addMonths(dateObj, months);
  dateObj = addYears(dateObj, years);

  return dateObj.toISOString();
}

export function toUTC(date) {
  let localDate;
  if (!(date instanceof Date)) {
    localDate = DateTime.fromISO(date, {
      zone: "Europe/Berlin",
    });
  } else {
    localDate = date;
  }

  return localDate.toUTC().toISO();
}

export function UTCtoTimeZone(dateStr, timeZone = "Europe/Berlin") {
  return DateTime.fromISO(dateStr, { zone: "utc" }).setZone(timeZone).toISO();
}

export function formatFreeTimeSlots(slots, timeZone = "Europe/Berlin") {
  const referringDate = DateTime.fromISO(slots[0].start).toFormat("dd.MM.yyyy");
  slots = slots.map(({ start, end }) => {
    return {
      start: UTCtoTimeZone(start, timeZone),
      end: UTCtoTimeZone(end, timeZone),
    };
  });

  if (!slots || slots.length === 0) {
    return "Es wurden keine freien Zeitfenster gefunden.";
  }

  const lines = slots.map(({ start, end }) => {
    const startTime = DateTime.fromISO(start).toFormat("HH:mm");
    const endTime = DateTime.fromISO(end).toFormat("HH:mm");
    return `- ${startTime} - ${endTime} Uhr`;
  });

  return `Folgende Zeitfenster für den *${referringDate}* sind frei:\n\n${lines.join(
    "\n"
  )}`;
}
