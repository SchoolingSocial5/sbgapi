import mongoose, { Schema } from 'mongoose'

export interface IStrategy extends Document {
  _id: string
  authority: string
  strategies: string[]
  remark: string
  staffName: string
}

const StrategySchema: Schema = new Schema(
  {
    authority: { type: String },
    strategies: { type: Array },
    remark: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Strategy = mongoose.model<IStrategy>('Strategy', StrategySchema)
