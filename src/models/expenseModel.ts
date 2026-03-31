import mongoose, { Schema } from 'mongoose'

export interface IExpense extends Document {
  _id: string
  amount: number
  description: string
  staffName: string
  username: string
  receipt: string
  createdAt: Date
}

const ExpenseSchema: Schema = new Schema(
  {
    amount: { type: Number, default: 0 },
    description: { type: String },
    staffName: { type: String },
    username: { type: String },
    receipt: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema)
