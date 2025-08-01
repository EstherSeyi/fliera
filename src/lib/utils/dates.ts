import { format, isPast, isValid, parseISO } from "date-fns";

export const formatDate = (
  dateInput: string | Date,
  formatString: string = "MMM d, yyyy",
  fallback = "Invalid date"
): string => {
  let parsedDate: Date;

  if (typeof dateInput === "string") {
    parsedDate = parseISO(dateInput);
  } else {
    parsedDate = dateInput;
  }

  if (!isValid(parsedDate)) {
    return fallback;
  }

  return format(parsedDate, formatString);
};

/**
 * Checks if a given date is in the past.
 * Returns `false` if the date is invalid.
 */
export const dateIsInThetPast = (eventDate: string | Date): boolean => {
  let parsedDate: Date;

  if (typeof eventDate === "string") {
    parsedDate = parseISO(eventDate);
  } else {
    parsedDate = eventDate;
  }

  if (!isValid(parsedDate)) {
    console.warn("Invalid event date:", eventDate);
    return false;
  }

  return isPast(parsedDate);
};
