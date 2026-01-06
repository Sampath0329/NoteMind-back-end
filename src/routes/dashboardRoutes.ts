import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getDashboardOverview } from "../controllers/dashBoardControllers";

const dashboardRouter = Router();

dashboardRouter.get(  '/overview',  authenticate,  getDashboardOverview);

export default dashboardRouter;