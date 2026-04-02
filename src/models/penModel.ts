import mongoose, { Schema, Document } from 'mongoose'

export interface IPen extends Document {
  name: string
  createdAt: Date
}

const PenSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const Pen = mongoose.model<IPen>('Pen', PenSchema)
