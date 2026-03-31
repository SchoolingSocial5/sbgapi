import mongoose, { Schema } from 'mongoose'

export interface IPosition extends Document {
  role: string
  position: string
  duties: string
  level: number
  salary: number
  phone: string
  allowSignup: boolean
}

const PositionSchema: Schema = new Schema(
  {
    role: { type: String },
    position: { type: String },
    duties: { type: String },
    level: { type: Number },
    salary: { type: Number },
    allowSignup: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Position = mongoose.model<IPosition>('Position', PositionSchema)

export interface ICompany extends Document {
  name: string
  domain: string
  email: string
  documents: string
  finalInstruction: string
  phone: string
  allowSignup: boolean
  allowApplicant: boolean
  headqauters: string
  newVersion: string
  newVersionLink: string
  createdAt: Date
}
const CompanySchema: Schema = new Schema(
  {
    name: { type: String },
    domain: { type: String },
    email: { type: String },
    documents: { type: String },
    finalInstruction: { type: String },
    welcomeMessage: { type: String },
    phone: { type: String },
    headquaters: { type: String },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    bankAccountName: { type: String },
    allowSignUp: { type: Boolean, default: true },
    allowApplicant: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Company = mongoose.model<ICompany>('Company', CompanySchema)

export interface IPolicy extends Document {
  name: string
  title: string
  content: string
  category: string
  createdAt: Date
}

const PolicySchema: Schema = new Schema(
  {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    category: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Policy = mongoose.model<IPolicy>('Policy', PolicySchema)
