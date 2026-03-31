import mongoose, { Schema } from 'mongoose'

export interface INotificationTemplate extends Document {
  content: string
  greetings: string
  title: string
  name: string
  officeUsername: string
  createdAt: Date
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    content: { type: String, default: '' },
    title: { type: String },
    name: { type: String, default: '' },
    officeUsername: { type: String, default: '' },
    greetings: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const NotificationTemplate = mongoose.model<INotificationTemplate>(
  'NotificationTemplate',
  NotificationTemplateSchema
)
