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
exports.Staff = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define an interface for the User document
const StaffSchema = new mongoose_1.Schema({
    email: {
        type: String,
    },
    username: {
        type: String,
    },
    phone: {
        type: String,
    },
    picture: { type: String, default: "" },
    role: { type: String, default: null },
    position: { type: String, default: null },
    salary: { type: Number, default: 10000 },
    level: { type: Number, default: 1 },
    userId: { type: String, default: null },
    areaId: { type: String, default: null },
    area: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: "" },
    continent: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true, // Automatically handle createdAt and updatedAt
});
exports.Staff = mongoose_1.default.model("Staff", StaffSchema);
