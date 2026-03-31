import mongoose, { Schema } from 'mongoose'

export interface IEmail extends Document {
  content: string
  picture: string
  title: string
  greetings: string
  name: string
  createdAt: Date
}

const EmailSchema: Schema = new Schema(
  {
    content: { type: String },
    sendable: { type: Boolean, default: false },
    title: { type: String },
    name: { type: String },
    picture: { type: String },
    greetings: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Email = mongoose.model<IEmail>('Email', EmailSchema)
