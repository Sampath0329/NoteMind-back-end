import { Router  } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { createNote, deleteNoteById, deleteNotePermanently, getAllNotes, getNoteById, getTrashedNotes, noteBySubjectId, pdfGeneration, restoreNote, searchNotes, updateNoteById } from "../controllers/noteControllers";

const noteRouter = Router();


noteRouter.get(  '/search',authenticate,  searchNotes);

noteRouter.post(  '/create',  authenticate,  createNote);

noteRouter.get(  '/all',  authenticate,  getAllNotes);

noteRouter.put(  '/update/:id',  authenticate,  updateNoteById);

noteRouter.patch(  '/delete/:id',  authenticate,  deleteNoteById);

noteRouter.get(  '/pdf/:id',  authenticate,  pdfGeneration);

noteRouter.get(  '/note/subject/:id',  authenticate,  noteBySubjectId);

noteRouter.get(  '/user/:id',  authenticate,  getNoteById);

noteRouter.get(  '/trashed',  authenticate,  getTrashedNotes);

noteRouter.patch(  '/restore/:id',  authenticate,  restoreNote);

noteRouter.delete(  '/delete/permanently/:id',  authenticate,  deleteNotePermanently);


export default noteRouter;

