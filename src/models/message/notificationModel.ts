import mongoose, { Schema } from 'mongoose'

export interface INotification extends Document {
  _id: string
  content: string
  title: string
  username: string
  unread: boolean
  createdAt: Date
}

const NotificationSchema: Schema = new Schema(
  {
    content: { type: String },
    unread: { type: Boolean, default: true },
    title: { type: String },
    username: { type: String },
    greetings: { type: String },
    fullName: { type: String },
    picture: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
)
