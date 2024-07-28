import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  createExercise,
  getUserLogsById,
} from '../controllers/controllers.js';

const router = Router();

/* GET users listing. */
router.get('/', getAllUsers);

/* POST a new user. */
router.post('/', createUser);

/* POST a new exercise. */
router.post('/:id/exercises/', createExercise);

/* GET user logs by user id. */
router.get('/:id/logs/', getUserLogsById);

export default router;
