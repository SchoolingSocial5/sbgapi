import mongoose, { Schema, Document } from 'mongoose'

export interface IMortality extends Document {
  _id: string
  birds: number
  birdAge: string
  birdClass: string
  reason: string
  productId: string
  productName: string
  pen: string
  staffName: string
  createdAt: Date
}

const MortalitySchema: Schema = new Schema(
  {
    birds: { type: Number, required: true },
    birdAge: { type: String },
    birdClass: { type: String },
    reason: { type: String },
    productId: { type: String, required: true },
    productName: { type: String },
    pen: { type: String },
    staffName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const Mortality = mongoose.model<IMortality>(
  'Mortality',
  MortalitySchema
)
