import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>("Subject", SubjectSchema);
