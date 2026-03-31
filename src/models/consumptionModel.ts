import mongoose, { Schema } from 'mongoose'

export interface IConsumption extends Document {
  _id: string
  birds: number
  birdAge: string
  consumption: number
  amount: number
  unitPrice: number
  birdClass: string
  feed: string
  weight: string
  remark: string
  consumptionUnit: string
}

const ConsumptionSchema: Schema = new Schema(
  {
    birds: { type: Number },
    birdAge: { type: String },
    consumption: { type: Number },
    amount: { type: Number },
    unitPrice: { type: Number },
    birdClass: { type: String },
    feed: { type: String },
    feedId: { type: String },
    weight: { type: String },
    remark: { type: String },
    consumptionUnit: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Consumption = mongoose.model<IConsumption>(
  'Consumption',
  ConsumptionSchema
)
