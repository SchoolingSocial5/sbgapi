import mongoose, { Schema } from 'mongoose'

export interface IMarketing extends Document {
  _id: string
  customerName: string
  customerAddress: string
  customerPhone: string
  remark: string
  isRegistered: boolean
  username: string
  email: string
  staffName: string
}

const MarketingSchema: Schema = new Schema(
  {
    customerName: { type: String },
    customerAddress: { type: String },
    customerPhone: { type: String },
    remark: { type: String },
    isRegistered: { type: Boolean },
    username: { type: String },
    email: { type: String },
    staffName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Marketing = mongoose.model<IMarketing>(
  'Marketing',
  MarketingSchema
)
