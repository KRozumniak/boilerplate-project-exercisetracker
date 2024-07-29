import { format } from 'date-fns-tz';

const defaultDateFormat = 'yyyy-MM-dd';
export const maxLimit = 1000;

export function getFormattedCurrentDate() {
  const date = new Date();
  const formattedDate = format(date, defaultDateFormat);
  return formattedDate;
}
