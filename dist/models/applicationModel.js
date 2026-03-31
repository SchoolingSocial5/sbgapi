"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ApplicationSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.Application = mongoose_1.default.model('Application', ApplicationSchema);
