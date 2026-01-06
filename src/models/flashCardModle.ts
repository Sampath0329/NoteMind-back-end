import mongoose, { Document, Schema } from "mongoose";
export interface IFlashcard extends Document {
  noteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  front: string;
  back: string;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    front: { type: String, required: true },
    back: { type: String, required: true }
  },
  { timestamps: true }
);

export const Flashcard = mongoose.model<IFlashcard>(
  "Flashcard",
  FlashcardSchema
);
