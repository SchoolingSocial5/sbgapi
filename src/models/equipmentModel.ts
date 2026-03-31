import mongoose, { Schema } from 'mongoose'

export interface IEquipment extends Document {
  _id: string
  equipment: string
  staffName: string
  staffUsername: string
  units: number
  authorizedBy: string
  issuedBy: string
  returnedAt: Date
}

const EquipmentSchema: Schema = new Schema(
  {
    equipment: { type: String },
    staffName: { type: String },
    units: { type: Number },
    authorizedBy: { type: String },
    staffUsername: { type: String },
    issuedBy: { type: String },
    remark: { type: String },
    returnedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)
export const Equipment = mongoose.model<IEquipment>(
  'Equipment',
  EquipmentSchema
)
