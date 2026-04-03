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
    pen: string
    penId: string
    productionData: { columnId: string; name: string; units: number }[]
    productId: string
    productName: string
    unitName: string
    unitPerPurchase: number
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
        pen: { type: String },
        penId: { type: String },
        productionData: { type: [Object], default: [] },
        productId: { type: String },
        productName: { type: String },
        unitName: { type: String },
        unitPerPurchase: { type: Number, default: 1 },
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
