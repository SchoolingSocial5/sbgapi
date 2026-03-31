import mongoose, { Schema } from 'mongoose'

export interface IActivity extends Document {
  _id: string
  staffUsername: string
  page: string
  staffName: string
}

const ActivitySchema: Schema = new Schema(
  {
    staffName: { type: String },
    page: { type: String },
    staffUsername: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema)
