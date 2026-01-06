import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getUserProfile, updateUser } from "../controllers/UserControllers";

const userRouter = Router();

userRouter.get(  "/getProfile",  authenticate,  getUserProfile);

userRouter.put( "/updateUser",  authenticate,  updateUser)

export default userRouter;