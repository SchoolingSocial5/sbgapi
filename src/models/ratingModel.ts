import mongoose, { Schema } from 'mongoose'

export interface IRating extends Document {
  _id: string
  rating: number
  review: string
  username: string
  fullName: string
  picture: string
  createdAt: Date
}

const RatingSchema: Schema = new Schema(
  {
    rating: { type: Number },
    review: { type: String },
    username: { type: String },
    fullName: { type: String },
    status: { type: Boolean },
    picture: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Rating = mongoose.model<IRating>('Rating', RatingSchema)
