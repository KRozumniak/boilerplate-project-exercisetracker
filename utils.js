import { format } from 'date-fns-tz';

const defaultDateFormat = 'yyyy-MM-dd';

export function getFormattedDate(value) {
  if (!isDateValid(value)) {
    const date = new Date();
    const formattedDate = format(date, defaultDateFormat);
    return formattedDate;
  }

  return value;
}

export function isDateValid(date) {
  if (!date) {
    return false;
  }

  const dateCheck = new Date(date);
  if (dateCheck === '12/31/1969') {
    return false;
  }

  return true;
}

export function validateNumberInput(n) {
  if (!n) {
    throw new Error('Number input invalid');
  }

  const convertedNumber = Number(n);
  if (Number.isNaN(convertedNumber)) {
    throw new Error('Number input invalid');
  }

  return convertedNumber;
}

export function validateStringInput(s) {
  if (!n.trim().length || !n) {
    throw new Error('String input invalid');
  }
  return s;
}

export function filterLogsByQueryParams(logs = [], query) {
  const from = query.from;
  const to = query.to;
  const limit = query.limit;

  // console.log(from);
  // console.log(to);
  // console.log(limit);

  // console.log('date from: ', Date(from));
  // console.log('date to: ', Date(to));

  if (!from && !to && !limit) {
    return logs;
  }

  if (from && !to && !limit) {
    const filteredLogs = logs.filter((log) => {
      return Date(log.date) >= Date(from);
    });
    return filteredLogs;
  }

  if (!from && to && !limit) {
    const filteredLogs = logs.filter((log) => {
      return Date(log.date) <= Date(to);
    });
    return filteredLogs;
  }

  if (from && to && !limit) {
    const filteredLogs = logs.filter((log) => {
      return Date(log.date) >= Date(from) && Date(log.date) <= Date(to);
    });
    return filteredLogs;
  }

  return logs;

  // if (from && to && limit) {
  //   const filteredLogs = logs.filter((log) => {
  //     return Date(log.date) >= Date(from) && Date(log.date) <= Date(to);
  //   });
  //   // console.log('// add limit calculation');

  //   const limitedFilteredLogs = [];

  //   filteredLogs.forEach((log) => {
  //     if (limitedFilteredLogs.length === +limit) {
  //       return;
  //     }
  //     limitedFilteredLogs.push(log);
  //   });

  //   // console.log('limitedFilteredLogs: ', limitedFilteredLogs);

  //   return limitedFilteredLogs;
  // }

  // const filteredExercises = [];
  // allExercises.forEach((exercise) => {
  //   if (exercise.userId === user.id) {
  //     const mappedExercise = {
  //       id: exercise.exerciseId,
  //       description: exercise.description,
  //       duration: exercise.duration,
  //       date: exercise.date,
  //     };

  //     filteredExercises.push(mappedExercise);
  //   }
  // });
}

export function buildErrorResponse({ code = 400, message }) {
  return {
    code,
    message,
  };
}
