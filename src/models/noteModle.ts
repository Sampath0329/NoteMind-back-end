import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  html: string;          // for viewing
  json: any;             // for restoring Tiptap editor state
  images: string[];
  pdfUrl?: string;
  subjectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isTrashed : boolean
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    html: { type: String, required: true },    // Tiptap output HTML
    json: { type: Schema.Types.Mixed },        // Tiptap editor state
    images: [{ type: String }],
    pdfUrl: { type: String },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isTrashed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", NoteSchema);
