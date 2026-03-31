import mongoose, { Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  active: string
  createdAt: Date
  fullName: string
  email: string
  isFirstTime: boolean
  isTwoFactor: boolean
  isSuspended: boolean
  password: string
  passwordExpiresAt: Date
  passwordResetCode: string
  phone: string
  picture: string
  username: string
  address: string
  staffPositions: string
  salary: number
  staffRanking: number
  totalPurchase: number
  status: string
}

const UserSchema: Schema = new Schema(
  {
    active: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    fullName: { type: String },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'A user with this email already exists'],
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
      lowercase: true,
    },
    isFirstTime: { type: Boolean, default: true },
    isTwoFactor: { type: Boolean, default: false },
    isSuspended: { type: Boolean },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    passwordExpiresAt: { type: Date, },
    passwordResetCode: { type: String, },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isPartPayment: { type: Boolean },
    playSound: { type: Boolean },
    roles: { type: String },
    username: { type: String },
    staffPositions: { type: String },
    staffRanking: { type: Number },
    salary: { type: Number, default: 0 },
    totalPurchase: { type: Number, default: 0 },
    status: { type: String, default: 'User' },
  },
  {
    timestamps: true,
  }
)
export const User = mongoose.model<IUser>('User', UserSchema)

export interface IDeletedUser extends Document {
  bioUserId: string
  email: string
  username: string
  picture: string
  createdAt: Date
  displayName: string
}

const DeletedUserSchema: Schema = new Schema(
  {
    bioUserId: { type: String, default: '' },
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    picture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    displayName: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

export const DeletedUser = mongoose.model<IDeletedUser>(
  'DeletedUser',
  DeletedUserSchema
)
