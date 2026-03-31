import mongoose, { Schema } from 'mongoose'

export interface IStaff extends Document {
  _id: string
  name: string
  username: string
  email: string
  phone: string
  picture: string
  rank: number
  salary: number
  positions: string
  createdAt: Date
}

const StaffSchema: Schema = new Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String },
    picture: { type: String },
    phone: { type: String },
    positions: { type: String },
    rank: { type: Number, default: 1 },
    salary: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Staff = mongoose.model<IStaff>('Staff', StaffSchema)
