import mongoose, { Schema } from 'mongoose'

export interface IBlog extends Document {
  _id: string
  title: string
  subtitle: string
  category: string
  content: string
  picture: string
  createdAt: Date
}

const BlogSchema: Schema = new Schema(
  {
    content: { type: String },
    title: { type: String },
    subtitle: { type: String },
    picture: { type: String },
    category: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Blog = mongoose.model<IBlog>('Blog', BlogSchema)
