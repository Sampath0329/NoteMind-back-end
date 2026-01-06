import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { Quiz } from "../models/quizQuestionModle";
import { QuizAttempt } from "../models/quizeAttamptModle";

export const getQuizAttempt = async (req: AuthRequest, res: Response) => {

  try {
    const userId = req.user._id;
    const quizeId = req.params.quizeId;
    const { userAnswer, correctAnswer, quizIndex } = req.body;
    let isAnswerCorrect = false;

    const quiz = await Quiz.find({ _id: quizeId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz Not Found...!" });
    }

    const currentQuiz = quiz[0].questions[quizIndex];

    if (userAnswer === currentQuiz.correctAnswer) {
      isAnswerCorrect = true;
    }

    const submittedAnswer = {
      question: quizIndex,
      userAnswer,
      correctAnswer,
      isCorrect: isAnswerCorrect
    };

    const quizquizAttempt = {
      userId,
      noteId : quiz[0].noteId,
      quizId : quizeId,
      score: isAnswerCorrect ? 1 : 0,
      maxScore: 1,
      submittedAnswers: [submittedAnswer]
    }

    await QuizAttempt.create(quizquizAttempt);

    res.status(200).json({ quizquizAttempt , message: "Quiz Attempt Successfully...!" } );
  } catch (error) {
    res.status(500).json({ message: "Quiz Attempt Failed...!" });
  }
}