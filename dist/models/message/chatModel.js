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
exports.Chat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChatSchema = new mongoose_1.Schema({
    username: { type: String },
    userId: { type: String },
    picture: { type: String, default: '' },
    media: { type: Array, default: [] },
    day: { type: String, default: '' },
    connection: { type: String, default: '' },
    repliedChat: { type: Object, default: {} },
    content: { type: String, default: '' },
    isSent: { type: Boolean, default: false },
    isSavedUsernames: { type: Array, default: [] },
    isReadUsernames: { type: Array, default: [] },
    isPinned: { type: Boolean, default: false },
    isFriends: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    receiverUsername: { type: String, default: '' },
    receiverPicture: { type: String, default: '' },
    receiverId: { type: String, default: '' },
    from: { type: String, default: '' },
    time: { type: Number, default: 0 },
    unreadUser: { type: Number, default: 0 },
    unreadReceiver: { type: Number, default: 0 },
    deletedUsername: { type: String, default: '' },
    receiverTime: { type: Date, default: Date.now },
    senderTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.Chat = mongoose_1.default.model('Chat', ChatSchema);
