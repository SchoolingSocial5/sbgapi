import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  name: string
  purchaseUnit: string
  units: number
  cartUnits: number
  unitPerPurchase: number
  discount: number
  costPrice: number
  price: number
  percentageProduction: number
  description: string
  picture: string
  type: 'Feed' | 'Medicine' | 'Water' | 'Livestock' | 'General'
  isProducing: boolean
  createdAt: Date
  seoTitle: string
  supName: string
  supAddress: string
  supPhone: string
  pId: string
}

const ProductSchema: Schema = new Schema(
  {
    description: { type: String },
    name: { type: String },
    purchaseUnit: { type: String },
    seoTitle: { type: String },
    picture: { type: String },
    supName: { type: String },
    supAddress: { type: String },
    supPhone: { type: String },
    consumptionUnit: { type: String },
    units: { type: Number },
    unitPerPurchase: { type: Number, default: 1 },
    price: { type: Number },
    percentageProduction: { type: Number },
    discount: { type: Number },
    costPrice: { type: Number },
    isBuyable: { type: Boolean, default: false },
    type: { type: String, enum: ['Feed', 'Medicine', 'Water', 'Livestock', 'General'], default: 'General' },
    isProducing: { type: Boolean, default: false },
    pId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Product = mongoose.model<IProduct>('Product', ProductSchema)

export interface IStocking extends Document {
  _id: string
  name: string
  units: number
  picture: string
  reason: string
  productId: string
  video: string
  amount: number
  percentageProduction: number
  isProfit: boolean
  pen: string
  purchaseUnit: string
  unitPerPurchase: number
}

const StockingSchema: Schema = new Schema(
  {
    staffName: { type: String },
    name: { type: String },
    picture: { type: String },
    reason: { type: String },
    units: { type: Number },
    productId: { type: String },
    video: { type: String },
    amount: { type: Number },
    percentageProduction: { type: Number },
    isProfit: { type: Boolean },
    pen: { type: String },
    purchaseUnit: { type: String },
    unitPerPurchase: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Stocking = mongoose.model<IStocking>('Stocking', StockingSchema)