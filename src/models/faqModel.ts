import mongoose, { Schema } from 'mongoose'

export interface IFaq extends Document {
  _id: string
  question: string
  answer: string
  category: string
  createdAt: Date
}

const FaqSchema: Schema = new Schema(
  {
    question: { type: String },
    answer: { type: String },
    category: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Faq = mongoose.model<IFaq>('Faq', FaqSchema)
