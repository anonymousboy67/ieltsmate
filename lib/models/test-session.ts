import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IScores {
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  overall: number
}

export interface ITestSession extends Document {
  userId: Types.ObjectId
  part1Transcript: string
  part2Transcript: string
  part3Transcript: string
  scores: IScores
  feedback: string
  completedAt: Date
  createdAt: Date
}

const ScoresSchema = new Schema<IScores>(
  {
    fluency: { type: Number, min: 0, max: 9 },
    vocabulary: { type: Number, min: 0, max: 9 },
    grammar: { type: Number, min: 0, max: 9 },
    pronunciation: { type: Number, min: 0, max: 9 },
    overall: { type: Number, min: 0, max: 9 },
  },
  { _id: false }
)

const TestSessionSchema = new Schema<ITestSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    part1Transcript: { type: String, default: "" },
    part2Transcript: { type: String, default: "" },
    part3Transcript: { type: String, default: "" },
    scores: { type: ScoresSchema },
    feedback: { type: String, default: "" },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const TestSession: Model<ITestSession> =
  mongoose.models.TestSession ?? mongoose.model<ITestSession>("TestSession", TestSessionSchema)

export default TestSession
