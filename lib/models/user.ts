import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: "student" | "teacher"
  classCode: string
  streak: number
  lastActiveDate: Date | null
  image?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // excluded from queries by default
    role: { type: String, enum: ["student", "teacher"], default: "student" },
    classCode: { type: String, required: true },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    image: { type: String },
  },
  { timestamps: true }
)

// Prevent model re-compilation in Next.js hot reload
const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)

export default User
