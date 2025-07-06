export const WeekDays = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,

  all() {
    return [0, 1, 2, 3, 4, 5, 6];
  },
};

import { startOfToday, addDays } from "date-fns";

export class BookingOptions {
  constructor({
    timeZone = "Europe/Berlin",
    workingHours = { start: "09:00", end: "22:00" },
    bookingDaysPrior = 2,
    allowedWeekDays = WeekDays.all(),
  } = {}) {
    this.timeZone = timeZone;
    this.workingHours = workingHours;
    this.bookingDaysPrior = bookingDaysPrior;
    this.allowedWeekDays = allowedWeekDays;
    this.firstAllowedDate = addDays(
      startOfToday(),
      bookingDaysPrior
    ).toISOString();
  }
}
