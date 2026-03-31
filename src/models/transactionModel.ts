import mongoose, { Schema } from 'mongoose'
import { IProduct } from './productModel'

export interface ITransaction extends Document {
  _id: string
  fullName: string
  username: string
  status: string
  nature: string
  email: string
  phone: string
  remark: string
  invoiceNumber: string
  delivery: string
  address: string
  guide: string
  distance: number
  fuel: number
  partPayment: number
  totalAmount: number
  adjustedTotal: number
  picture: string
  cartProducts: IProduct[]
  createdAt: Date
}

const TransactionSchema: Schema = new Schema(
  {
    fullName: { type: String },
    staffName: { type: String },
    username: { type: String },
    picture: { type: String },
    email: { type: String },
    phone: { type: String },
    payment: { type: String },
    supName: { type: String },
    supAddress: { type: String },
    supPhone: { type: String },
    product: { type: Object },
    remark: { type: String },
    invoiceNumber: { type: String },
    address: { type: String },
    guide: { type: String },
    delivery: { type: String },
    startingLocation: { type: String },
    totalAmount: { type: Number },
    distance: { type: Number },
    fuel: { type: Number },
    adjustedTotal: { type: Number },
    partPayment: { type: Number },
    receipt: { type: String },
    nature: { type: String },
    status: { type: Boolean },
    isProfit: { type: Boolean, default: false },
    cartProducts: { type: Array },
    startedAt: { type: Date },
    endedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  TransactionSchema
)
