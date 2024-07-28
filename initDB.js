import Database from 'better-sqlite3';

export const db = new Database('app.db');

const queryUsers = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
  )
`;

const queryExercises = `
  CREATE TABLE IF NOT EXISTS exercises (
    exerciseId INTEGER PRIMARY KEY,
    description TEXT,
    duration INTEGER,
    date TEXT,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`;

db.exec(queryUsers);
db.exec(queryExercises);
