import mongoose, { Schema } from 'mongoose'

export interface ISalary extends Document {
    _id: string
    amount: number
    staffs: number
    description: string
    staffName: string
    username: string
    receipt: string
    createdAt: Date
}

const SalarySchema: Schema = new Schema(
    {
        amount: { type: Number, default: 0 },
        staffs: { type: Number, default: 0 },
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
export const Salary = mongoose.model<ISalary>('Salary', SalarySchema)
