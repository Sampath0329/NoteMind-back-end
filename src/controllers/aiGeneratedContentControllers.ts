import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { Summary } from "../models/summeryModle";
import { Explanation } from "../models/explanationModle";
import { Quiz } from "../models/quizQuestionModle";
import { Flashcard } from "../models/flashCardModle";

export const getGeneratedContent = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const summary = await Summary.findOne({noteId : noteId});
    const explanation = await Explanation.findOne({noteId : noteId});
    const quiz = await Quiz.findOne({noteId : noteId});
    const flashcard = await Flashcard.find({noteId : noteId});

    res.status(200).json({
      message: "Ai generated content fetched Successfully...!",
      summary,
      explanation,
      quiz,
      flashcard,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Can't get ai generated content!" });
  }
}