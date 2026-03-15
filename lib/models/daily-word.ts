import mongoose, { Schema, Document, Model } from "mongoose"

export interface IDailyWord extends Document {
  word: string
  definition: string
  pronunciation: string // e.g. "/ˌɛnvərənˈmɛntl/"
  exampleSentence: string // in IELTS context
  synonyms: string[]
  topic: string // environment, technology, health, etc.
  band: number // target band level (6, 7, 8, 9)
  assignedDate?: string // "YYYY-MM-DD" when this word was the daily word
  createdAt: Date
}

const DailyWordSchema = new Schema<IDailyWord>(
  {
    word: { type: String, required: true, unique: true },
    definition: { type: String, required: true },
    pronunciation: { type: String, required: true },
    exampleSentence: { type: String, required: true },
    synonyms: [{ type: String }],
    topic: { type: String, required: true },
    band: { type: Number, enum: [6, 7, 8, 9], default: 7 },
    assignedDate: { type: String }, // set when word is served as daily word
  },
  { timestamps: true }
)

const DailyWord: Model<IDailyWord> =
  mongoose.models.DailyWord ?? mongoose.model<IDailyWord>("DailyWord", DailyWordSchema)

export default DailyWord
