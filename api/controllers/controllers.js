import { db } from '../../initDB.js';

import {
  buildError,
  filterLogsByQueryParams,
  getValidatedInputs,
} from '../../utils.js';

export function createExercise(req, res, next) {
  try {
    const inputs = getValidatedInputs({
      ...req.body,
      userId: req.params.id,
    });

    if (inputs.error) {
      console.log('erroing out');
      res.status(400).json(inputs.error);
      return;
    }

    const { userId, duration, description, date } = inputs;

    const result = db
      .prepare(
        'INSERT INTO exercises (description, duration, date, userId) VALUES (?, ?, ?, ?)'
      )
      .run(description, duration, date, userId);

    const createdExercise = getExercisesById(result.lastInsertRowid);

    return res.json(createdExercise);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      const error = buildError({
        message: 'Associated user does not exist',
      });
      res.status(error.code).json({ error });
    }
    res.status(400).json({ error: 'Bad Request' });
  }
}

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

    return buildError({
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
    return buildError({
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
