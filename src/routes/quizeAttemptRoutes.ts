import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getQuizAttempt } from '../controllers/quizAttemptControllers';

const quizeAttemptRouter = Router();

quizeAttemptRouter.post('/attempt/:quizeId',  authenticate,  getQuizAttempt)

export default quizeAttemptRouter;