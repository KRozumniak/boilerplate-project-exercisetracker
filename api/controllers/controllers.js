import { db } from '../../initDB.js';

import {
  buildErrorResponse,
  filterLogsByQueryParams,
  getFormattedDate,
} from '../../utils.js';

export const createExercise = (userId, body) => {
  const { description, duration, date } = body;
  const exerciseDate = getFormattedDate(date);

  try {
    const result = db
      .prepare(
        'INSERT INTO exercises (description, duration, date, userId) VALUES (?, ?, ?, ?)'
      )
      .run(description, duration, exerciseDate, userId);

    const createdExercise = getExercisesById(result.lastInsertRowid);

    return createdExercise;
  } catch (error) {
    console.log(error);
    return buildErrorResponse({
      message: 'Bad request',
    });
  }
};

export function getAllUsers() {
  const users = db.prepare('SELECT * FROM users').all();
  return users;
}

export const getUserById = (id) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user;
};

export function getUserLogsById(userId, query) {
  if (!userId) {
    throw new Error('User does not exist');
  }
  const intUserId = Number(userId);
  const selectedExercises = getExercisesByUserId(intUserId, query.limit);

  // revisit the date filters
  const filteredLogsByQueryParams = filterLogsByQueryParams(
    selectedExercises,
    query
  );

  return {
    logs: filteredLogsByQueryParams,
    count: filteredLogsByQueryParams.length,
  };
}

export const createUser = (username) => {
  try {
    if (!isUsernameValid(username)) {
      throw new Error('Invalid username');
    }
    const result = db
      .prepare('INSERT INTO users (username) VALUES (?)')
      .run(username);

    const newUser = getUserById(result.lastInsertRowid);
    return newUser;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      error.message = 'Username already exists';
    }

    return buildErrorResponse({
      message: error.message,
    });
  }
};

function getAllExercises() {
  try {
    const allExercises = db.prepare('SELECT * FROM exercises').all();

    if (!allExercises) {
      throw new Error('Exercises do not exist');
    }

    return allExercises;
  } catch (error) {
    return buildErrorResponse({
      message: error.message,
    });
  }
}

function getExercisesByUserId(id, limit) {
  const maxLimit = 1000;
  const qLimit = Number(limit) || maxLimit;

  const selectedExercises = db
    .prepare('SELECT * FROM exercises WHERE userId = ? ORDER BY userId LIMIT ?')
    .all(id, qLimit);

  if (!selectedExercises) {
    throw new Error('Exercises do not exist, 400');
  }

  return selectedExercises;
}

function getExercisesById(id) {
  const searchedExercise = db
    .prepare('SELECT * FROM exercises WHERE exerciseId = ?')
    .get(id);

  if (!searchedExercise) {
    throw new Error('Exercise does not exist, 400');
  }

  return searchedExercise;
}

function isUsernameValid(username) {
  if (!username) {
    return false;
  }

  if (!username.trim().length) {
    return false;
  }

  return true;
}
