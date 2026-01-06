import mongoose, { Document, Schema } from "mongoose";
export interface ISummary extends Document {
  noteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  summaryText: string;
}

const SummarySchema = new Schema<ISummary>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    summaryText: { type: String, required: true }
  },
  { timestamps: true }
);

export const Summary = mongoose.model<ISummary>("Summary", SummarySchema);
