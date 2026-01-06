import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  imageUrl?: string;
  totalNotes: number;
  totalSummaries: number;
  totalQuestions: number;
  totalFlashcards: number;
  resetPasswordToken: String | undefined,
  resetPasswordExpire: Date | undefined
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String , required: false },
    totalNotes: { type: Number, default: 0 },
    totalSummaries: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    totalFlashcards: { type: Number, default: 0 },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpire: { type: Date , required: false }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
