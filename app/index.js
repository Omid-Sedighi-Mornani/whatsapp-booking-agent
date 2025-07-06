import "dotenv/config";
import { client } from "./whatsapp/client.js";
import { BookingOptions } from "./utils/options.js";

export const BOOKING_OPTIONS = new BookingOptions();

client.initialize();
