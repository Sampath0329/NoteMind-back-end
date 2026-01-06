import mongoose, { Document, Schema } from "mongoose";
export interface ISubmittedAnswer {
  question: Number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  noteId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  score: number;
  maxScore: number;
  submittedAnswers: ISubmittedAnswer[];
  date: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },

    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },

    submittedAnswers: [
      {
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
      }
    ],

    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  QuizAttemptSchema
);
