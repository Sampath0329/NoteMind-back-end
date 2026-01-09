import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import cloudinaryRouter from "./routes/cloudinaryRoute";
import noteRouter from "./routes/noteRoute";
import subjectRouter from "./routes/subjectsRoute";
import aiRouter from "./routes/aiRoutes";
import quizeAttemptRouter from "./routes/quizeAttemptRoutes";
import userRouter from "./routes/userRoutes";
import cookieParser from 'cookie-parser';
import dashboardRouter from "./routes/dashboardRoutes";
import aiGeneratedContentRouter from "./routes/aiGeneratedContentRoutes";
import connectDB from "./config/dbConfig";

dotenv.config();
connectDB();

const SERVER_PORT = process.env.SERVER_PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

const app = express();

app.use(express.json());
app.use(cookieParser())

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://note-mind-front-end.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

//auth router
app.use('/api/v1/auth', authRouter);

// User Router
app.use('/api/v1/user', userRouter);

//cloudinary router
app.use('/api/v1/cloudinary', cloudinaryRouter);

// subject router
app.use('/api/v1/subject', subjectRouter);

//note router
app.use('/api/v1/note', noteRouter);

// AI Generated Content
app.use('/api/v1/aiGeneratedContent',aiGeneratedContentRouter);

// AI router
app.use('/api/v1/ai', aiRouter);

// Quiz Attempt router
app.use('/api/v1/quiz', quizeAttemptRouter);

// Dashboard Router
app.use('/api/v1/dashboard', dashboardRouter);



app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});


