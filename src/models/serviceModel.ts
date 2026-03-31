import mongoose, { Schema } from 'mongoose'

export interface IService extends Document {
  _id: string
  description: string
  title: string
  username: string
  staffName: string
  video: string
  clientName: string
  clientPhone: string
  clientAddress: string
  amount: number
  startedAt: Date
  endedAt: Date
  receipt: string
  createdAt: Date
}

const ServiceSchema: Schema = new Schema(
  {
    clientName: { type: String },
    clientPhone: { type: String },
    clientAddress: { type: String },
    receipt: { type: String },
    amount: { type: Number },
    description: { type: String },
    staffName: { type: String },
    title: { type: String },
    warranty: { type: String },
    video: { type: String },
    username: { type: String },
    startedAt: { type: Date },
    endedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Service = mongoose.model<IService>('Service', ServiceSchema)
