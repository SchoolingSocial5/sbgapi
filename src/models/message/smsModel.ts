import mongoose, { Schema } from 'mongoose'

export interface ISms extends Document {
  content: string
  name: string
  createdAt: Date
}

const SmsSchema: Schema = new Schema(
  {
    content: { type: String, default: '' },
    title: { type: String },
    name: { type: String, default: '' },
    greetings: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Sms = mongoose.model<ISms>('Sms', SmsSchema)
