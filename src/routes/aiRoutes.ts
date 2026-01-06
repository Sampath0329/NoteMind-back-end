import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getExplanation, getFlashcards, getQuizQuestions, getSummary,generateAutoNote } from '../controllers/aiControllers';

const aiRouter = Router();

aiRouter.get(  '/summary/:id',  authenticate ,  getSummary);

aiRouter.get(  '/explanation/:id',  authenticate ,  getExplanation);

aiRouter.get(  '/quiz/:id',  authenticate ,  getQuizQuestions);

aiRouter.get(  '/flashcards/:id',  authenticate ,  getFlashcards);

aiRouter.post(  '/auto-note',  authenticate ,  generateAutoNote);

export default aiRouter;