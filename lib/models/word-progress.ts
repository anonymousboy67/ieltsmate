import mongoose, { Schema, Document, Model, Types } from "mongoose"

export type WordStatus = "new" | "learning" | "mastered"

export interface IWordProgress extends Document {
  userId: Types.ObjectId
  wordId: string // the word itself as identifier
  status: WordStatus
  nextReviewDate: Date
  reviewCount: number
  lastSeenDate: Date
  createdAt: Date
  updatedAt: Date
}

const WordProgressSchema = new Schema<IWordProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wordId: { type: String, required: true },
    status: { type: String, enum: ["new", "learning", "mastered"], default: "new" },
    nextReviewDate: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 },
    lastSeenDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Compound index: one progress record per user per word
WordProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true })

const WordProgress: Model<IWordProgress> =
  mongoose.models.WordProgress ?? mongoose.model<IWordProgress>("WordProgress", WordProgressSchema)

export default WordProgress
