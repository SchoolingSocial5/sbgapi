import mongoose, { Schema } from 'mongoose'

export interface IApplication extends Document {
    _id: string
    firstName: string
    middleName: string
    lastName: string

    gender: string
    maritalStatus: string
    dob: Date,

    nationality: string
    state: string
    lga: string
    homeAddress: string

    residenceCountry: string
    residenceState: string
    residenceLga: string
    residenceAddress: string

    phone: string
    email: string

    refereeName: string
    refereePhone: string
    refereeRelationship: string
    applicationLetter: string

    school: string
    course: string
    degree: string

    position: string
    username: string
    certificateUrl: string
    photoUrl: string
    createdAt: Date
}

const ApplicationSchema: Schema = new Schema(
    {
        firstName: { type: String },
        middleName: { type: String },
        lastName: { type: String },

        gender: { type: String },
        maritalStatus: { type: String },
        dob: Date,

        nationality: { type: String },
        state: { type: String },
        lga: { type: String },
        homeAddress: { type: String },

        residenceCountry: { type: String },
        residenceState: { type: String },
        residenceLga: { type: String },
        residenceAddress: { type: String },

        phone: { type: String },
        email: { type: String },

        refereeName: { type: String },
        refereePhone: { type: String },
        refereeRelationship: { type: String },
        applicationLetter: { type: String },

        school: { type: String },
        course: { type: String },
        degree: { type: String },

        position: { type: String },
        username: { type: String },
        certificateUrl: { type: String },
        photoUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
)
export const Application = mongoose.model<IApplication>('Application', ApplicationSchema)
