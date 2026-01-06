import mongoose, { Document, Schema } from "mongoose";
export interface IExplanation extends Document {
  noteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  explanation: string;
}

const ExplanationSchema = new Schema<IExplanation>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    explanation: { type: String, required: true }
  },
  { timestamps: true }
);

export const Explanation = mongoose.model<IExplanation>("Explanation", ExplanationSchema);
