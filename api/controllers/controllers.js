import { db } from '../../initDB.js';

import {
  buildError,
  filterLogsByQueryParams,
  getValidatedInputs,
  isUserIdValid,
  isUsernameValid,
} from '../../utils.js';

export function createExercise(req, res, next) {
  try {
    const inputs = getValidatedInputs({
      ...req.body,
      userId: req.params.id,
    });

    if (inputs.error) {
      return res.status(400).json(inputs.error);
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
      return res.status(error.code).json({ error });
    }
    return res.status(400).json({ error: 'Bad Request' });
  }
}

export function getAllUsers(req, res, next) {
  const users = db.prepare('SELECT * FROM users').all();

  if (!users.length) {
    const error = buildError({
      code: 404,
      message: 'No users found',
    });
    return res.status(error.code).json(error);
  }

  return res.json(users);
}

export const getUserById = (id) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user;
};

export function getUserLogsById(req, res, next) {
  if (!isUserIdValid(req.params.id)) {
    const error = buildError({
      message: 'User id is invalid',
    });
    return res.status(error.code).json(error);
  }

  const { query, params } = req;
  const userId = Number(params.id);

  const selectedExercises = getExercisesByUserId(userId, query.limit);

  if (!selectedExercises.length) {
    const error = buildError({
      code: 404,
      message: 'Exercises not found',
    });
    return res.status(error.code).json(error);
  }

  // revisit the date filters
  const filteredLogsByQueryParams = filterLogsByQueryParams(
    selectedExercises,
    query
  );

  const logs = {
    logs: filteredLogsByQueryParams,
    count: filteredLogsByQueryParams.length,
  };
  return res.json(logs);
}

export const createUser = (req, res, next) => {
  try {
    const { username } = req.body;
    if (!isUsernameValid(username)) {
      throw new Error('Invalid username');
    }
    const result = db
      .prepare('INSERT INTO users (username) VALUES (?)')
      .run(username);

    const newUser = getUserById(result.lastInsertRowid);
    return res.json(newUser);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      err.message = 'Username already exists';
    }

    const error = buildError({
      message: err.message,
    });
    return res.status(error.code).json(error);
  }
};

function getExercisesByUserId(id, limit) {
  const maxLimit = 1000;
  const qLimit = Number(limit) || maxLimit;

  const selectedExercises = db
    .prepare('SELECT * FROM exercises WHERE userId = ? ORDER BY userId LIMIT ?')
    .all(id, qLimit);

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
