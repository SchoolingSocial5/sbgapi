import mongoose, { Schema, Document } from 'mongoose'

export interface IColumn extends Document {
  name: string
  createdAt: Date
}

const ColumnSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const Column = mongoose.model<IColumn>('Column', ColumnSchema)
