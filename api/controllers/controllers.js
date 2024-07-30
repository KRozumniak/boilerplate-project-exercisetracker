import { throwError } from '../../utils/error-utils.js';
import { db } from '../../initDB.js';

import {
  getValidatedInputs,
  isDateQueryParamValid,
  isLimitQueryParamValid,
  isUserIdValid,
  isUsernameValid,
} from '../../validation.js';
import { maxLimit } from '../../utils/utils.js';

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

    const queriedExercises = getQueriedExercisesByUserId({
      id: userId,
      to: query.to,
      from: query.from,
      limit: query.limit,
    });

    if (!queriedExercises.length) {
      throwError('No exercises found', 404);
    }

    const logs = {
      logs: queriedExercises,
      count: queriedExercises.length,
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

function getQueriedExercisesByUserId({ id, to, from, limit = maxLimit }) {
  const initialQuery = 'SELECT * FROM exercises WHERE userId = ?';
  let query = '';

  if (from && to) {
    query = `${initialQuery} AND date BETWEEN date(?) AND date(?) ORDER BY date LIMIT ?`;
    return db.prepare(query).all(id, from, to, limit);
  }

  if (from && !to) {
    query = `${initialQuery} AND date BETWEEN date(?) AND date(date) ORDER BY date LIMIT ?`;
    return db.prepare(query).all(id, from, limit);
  }

  if (!from && to) {
    query = `${initialQuery} AND date BETWEEN date(date) AND date(?) ORDER BY date LIMIT ?`;
    return db.prepare(query).all(id, to, limit);
  }

  query = `${initialQuery} ORDER BY date LIMIT ?`;
  return db.prepare(query).all(id, limit);
}
