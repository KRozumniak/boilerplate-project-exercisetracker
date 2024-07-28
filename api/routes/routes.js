import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  createExercise,
  getUserLogsById,
} from '../controllers/controllers.js';

const router = Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  const users = getAllUsers();
  res.json(users);
});

/* POST a new user. */
router.post('/', function (req, res, next) {
  const { username } = req.body;
  const users = createUser(username);
  res.json(users);
});

/* POST a new exercise. */
router.post('/:id/exercises/', createExercise);

/* GET user logs by user id. */
router.get('/:id/logs/', function (req, res, next) {
  const { id } = req.params;
  const { query } = req;

  const logs = getUserLogsById(id, query);
  res.json(logs);
});

export default router;
