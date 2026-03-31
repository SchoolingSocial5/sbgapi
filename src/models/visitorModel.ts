import mongoose, { Schema } from 'mongoose'

export interface IVisitor extends Document {
  _id: string
  name: string
  purpose: string
  phone: string
  leftAt: Date
}

const VisitorSchema: Schema = new Schema(
  {
    name: { type: String },
    purpose: { type: String },
    phone: { type: String },
    remark: { type: String },
    visited: { type: String },
    staffUsername: { type: String },
    leftAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema)
