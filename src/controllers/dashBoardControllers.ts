import { Response } from "express";
import mongoose from "mongoose";
import { Note } from "../models/noteModle";
import { Summary } from "../models/summeryModle";
import { Quiz } from "../models/quizQuestionModle";
import { QuizAttempt } from "../models/quizeAttamptModle";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getDashboardOverview = async (req:AuthRequest, res: Response) => {
  try {
    const userId = req.user._id; 
    console.log(userId)
    
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [
      totalNotes,
      totalSummaries,
      totalQuizzes,
      totalFlashcards, 
      recentNotes,
      notesGraphData,
      quizActivityData
    ] = await Promise.all([
      
      Note.countDocuments({ userId }),
      Summary.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      0,

      Note.find({ userId })
        .sort({ createdAt: -1 }) 
        .limit(5)
        .select("title createdAt subjectId tags") 
        .populate("subjectId", "name color"), 

      Note.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 7 }
      ]),

      QuizAttempt.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
            attempts: { $sum: 1 },
            avgScore: { $avg: "$score" } 
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 7 }
      ])
    ]);

    const formattedData = {
      totals: {
        notes: totalNotes,
        summaries: totalSummaries,
        quizzes: totalQuizzes,
        flashcards: totalFlashcards
      },
      recentNotes,
      graphs: {
        notesCreation: notesGraphData.map((item) => ({
          date: item._id,
          count: item.count,
        })),
        quizActivity: quizActivityData.map((item) => ({
          date: item._id,
          attempts: item.attempts,
          avgScore: Math.round(item.avgScore)
        }))
      }
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });

  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ message: "Failed to load dashboard overview" });
  }
};