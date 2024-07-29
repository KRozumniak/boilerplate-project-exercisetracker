import { throwError } from '../../utils/error-utils.js';
import { db } from '../../initDB.js';

import { filterLogsByDate } from '../../utils/utils.js';

import {
  getValidatedInputs,
  isDateQueryParamValid,
  isLimitQueryParamValid,
  isUserIdValid,
  isUsernameValid,
} from '../../validation.js';

export function createExercise(req, res, next) {
  try {
    const inputs = getValidatedInputs({
      ...req.body,
      userId: req.params.id,
    });

    if (inputs.error) {
      throwError(inputs.error.message, 400);
    }

    const { userId, duration, description, date } = inputs;

    const result = db
      .prepare(
        'INSERT INTO exercises (description, duration, date, userId) VALUES (?, ?, ?, ?)'
      )
      .run(description, duration, date, userId);

    const createdExercise = db
      .prepare('SELECT * FROM exercises WHERE exerciseId = ?')
      .get(result.lastInsertRowid);

    return res.json(createdExercise);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      err.message = 'Associated user does not exist';
      err.statusCode = 400;
    }

    next(err);
  }
}

export function getAllUsers(req, res, next) {
  try {
    const users = db.prepare('SELECT * FROM users').all();

    if (!users.length) {
      throwError('No users found', 404);
    }

    return res.json(users);
  } catch (error) {
    next(error);
  }
}

export const getUserById = (id) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      throwError('No user found', 404);
    }

    return user;
  } catch (error) {
    next(error);
  }
};

export function getUserLogsById(req, res, next) {
  try {
    if (!isUserIdValid(req.params.id)) {
      throwError('Invalid user id', 400);
    }

    const { query, params } = req;
    const userId = Number(params.id);

    if (query && query.from) {
      if (!isDateQueryParamValid(query.from)) {
        throwError('Invalid from date query', 400);
      }
    }

    if (query && query.to) {
      if (!isDateQueryParamValid(query.to)) {
        throwError('Invalid to date query', 400);
      }
    }

    if (query && query.limit) {
      if (!isLimitQueryParamValid(query.limit)) {
        throwError('Invalid limit query', 400);
      }
    }

    const selectedExercises = getExercisesByUserId(userId, query.limit);
    if (!selectedExercises.length) {
      throwError('No exercises found', 404);
    }

    const filteredLogsByQueryParams = filterLogsByDate(
      selectedExercises,
      query
    );

    if (!filteredLogsByQueryParams.length) {
      throwError('No queried exercises found', 404);
    }

    const logs = {
      logs: filteredLogsByQueryParams,
      count: filteredLogsByQueryParams.length,
    };
    return res.json(logs);
  } catch (error) {
    next(error);
  }
}

export const createUser = (req, res, next) => {
  try {
    const { username } = req.body;
    if (!isUsernameValid(username)) {
      throwError('Invalid username', 400);
    }
    const result = db
      .prepare('INSERT INTO users (username) VALUES (?)')
      .run(username);

    const newUser = getUserById(result.lastInsertRowid);
    return res.json(newUser);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      err.message = 'Username already exists';
      err.statusCode = 400;
    }

    next(err);
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
