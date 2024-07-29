import { format } from 'date-fns-tz';

const defaultDateFormat = 'yyyy-MM-dd';

export function getFormattedCurrentDate() {
  const date = new Date();
  const formattedDate = format(date, defaultDateFormat);
  return formattedDate;
}

export function filterLogsByDate(logs = [], { from, to }) {
  if (!from && !to) {
    return logs;
  }

  if (from && to) {
    const filteredLogs = logs.filter((log) => {
      return (
        new Date(log.date) >= new Date(from) &&
        new Date(log.date) <= new Date(to)
      );
    });
    return filteredLogs;
  }

  if (from && !to) {
    const filteredLogs = logs.filter((log) => {
      return new Date(log.date) >= new Date(from);
    });
    return filteredLogs;
  }

  if (!from && to) {
    const filteredLogs = logs.filter((log) => {
      return new Date(log.date) <= new Date(to);
    });
    return filteredLogs;
  }

  return logs;
}
