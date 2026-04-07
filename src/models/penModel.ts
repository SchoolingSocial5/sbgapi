import mongoose, { Schema, Document } from 'mongoose'

export interface IPen extends Document {
  name: string
  livestockId?: string
  livestockName?: string
  columns: { name: string; _id: string }[]
  createdAt: Date
}

const PenSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    livestockId: { type: String },
    livestockName: { type: String },
    columns: {
      type: [
        {
          name: { type: String, required: true },
        },
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const Pen = mongoose.model<IPen>('Pen', PenSchema)
