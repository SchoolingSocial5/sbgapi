import mongoose, { Schema } from 'mongoose'

export interface ISocial extends Document {
  _id: string
  name: string
  post: string
  picture: string
  socialType: string
  likes: number
  comments: number
  url: string
  staffName: string
}

const SocialSchema: Schema = new Schema(
  {
    name: { type: String },
    post: { type: String },
    picture: { type: String },
    socialType: { type: String },
    likes: { type: Number },
    comments: { type: Number },
    url: { type: String },
    staffName: { type: String },
    updatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Social = mongoose.model<ISocial>('Social', SocialSchema)
