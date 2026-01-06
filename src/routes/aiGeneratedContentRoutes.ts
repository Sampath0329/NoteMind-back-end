import { Router } from "express";
import { getGeneratedContent } from "../controllers/aiGeneratedContentControllers";
import { authenticate } from "../middlewares/authMiddleware";

const aiGeneratedContentRouter = Router();

aiGeneratedContentRouter.get(  '/:id',  authenticate,  getGeneratedContent);

export default aiGeneratedContentRouter;