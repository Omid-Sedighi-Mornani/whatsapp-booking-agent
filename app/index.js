import "dotenv/config";
import { client } from "./whatsapp/client.js";
import { BookingOptions, WeekDays } from "./utils/options.js";

const options = {
  timeZone: "Europe/Berlin",
  workingHours: { start: "09:00", end: "22:00" },
  bookingDaysPrior: 2,
  allowedWeekDays: [WeekDays.FRI, WeekDays.SAT, WeekDays.SUN],
};

export const BOOKING_OPTIONS = new BookingOptions(options);

client.initialize();
