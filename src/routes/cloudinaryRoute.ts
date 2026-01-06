import { Router } from "express";
import { imageUpload, pdfUpload, profileUpload } from "../controllers/cloudinaryControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { uploadMulter } from "../middlewares/fileMiddleware";

const cloudinaryRouter = Router();

cloudinaryRouter.post(    '/image',    authenticate,    uploadMulter.single("file"),    imageUpload)

cloudinaryRouter.post(    '/pdf',    authenticate,    uploadMulter.single("file"),    pdfUpload)

cloudinaryRouter.post(    '/profile',    authenticate,    uploadMulter.single("file"),    profileUpload)

export default cloudinaryRouter;
