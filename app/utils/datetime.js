import { addMinutes, addSeconds, addHours, parse, format } from "date-fns";
import { DateTime } from "luxon";
import { BOOKING_OPTIONS } from "../index.js";

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
  },
  timeZone = BOOKING_OPTIONS.timeZone
) {
  let dateObj;

  if (!(date instanceof Date)) {
    dateObj = DateTime.fromISO(date, { zone: timeZone });
  } else {
    dateObj = DateTime.fromJSDate(date, { zone: timeZone });
  }

  dateObj = dateObj.plus({
    seconds,
    minutes,
    hours,
    days,
    weeks,
    months,
    years,
  });

  return dateObj.toISO();
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

export function UTCtoTimeZone(dateStr, timeZone = BOOKING_OPTIONS.timeZone) {
  return DateTime.fromISO(dateStr, { zone: "utc" }).setZone(timeZone).toISO();
}

export function formatFreeTimeSlots(
  slots,
  timeZone = BOOKING_OPTIONS.timeZone
) {
  const referringDate = DateTime.fromISO(slots[0].start).toFormat("dd.MM.yyyy");
  slots = slots.map(({ start, end }) => {
    return {
      start: UTCtoTimeZone(start, timeZone),
      end: UTCtoTimeZone(end, timeZone),
    };
  });

  console.log("formatFreeTimeSlots:\n", slots);

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

export function timeStringToDecimal(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return [h, m];
}

export function isInTimeRange(timeStr, startStr, endStr) {
  const baseDate = "1970-01-01T";
  const time = new Date(baseDate + timeStr + ":00");
  const start = new Date(baseDate + startStr + ":00");

  // Wenn über Mitternacht, endDate am nächsten Tag
  const endDateStr = startStr < endStr ? baseDate : "1970-01-02T";
  const end = new Date(endDateStr + endStr + ":00");

  return time >= start && time <= end;
}

export function isInBookingRange(dateTime) {
  const { firstAllowedDate } = BOOKING_OPTIONS;
  const allowedStartDate = new Date(firstAllowedDate);

  return allowedStartDate <= dateTime;
}

export function checkForValidDate({ date, time }) {
  const { workingHours, allowedWeekDays } = BOOKING_OPTIONS;

  const dateTime = new Date(`${date}T${time}:00`);
  const isInAllowedWeekDays = allowedWeekDays.includes(dateTime.getDay());
  const isInAllowedBookingRange = isInBookingRange(dateTime);
  const isInAllowedTimeRange = isInTimeRange(
    time,
    workingHours.start,
    workingHours.end
  );

  return isInAllowedBookingRange && isInAllowedWeekDays && isInAllowedTimeRange;
}
