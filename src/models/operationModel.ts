import mongoose, { Schema } from 'mongoose'

export interface IOperation extends Document {
    _id: string
    livestockNumber: number
    livestockAge: string
    operation: string
    livestock: string
    weight: string
    remark: string
    medication: string
    quantity: string
    staffName: string
    userId: string
}

const OperationSchema: Schema = new Schema(
    {
        livestockNumber: { type: Number },
        livestockAge: { type: String },
        operation: { type: String },
        livestock: { type: String },
        weight: { type: String },
        remark: { type: String },
        medication: { type: String },
        quantity: { type: String },
        staffName: { type: String },
        userId: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
)
export const Operation = mongoose.model<IOperation>(
    'Operation',
    OperationSchema
)
