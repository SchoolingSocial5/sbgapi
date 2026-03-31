"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const connection_1 = __importDefault(require("./database/connection"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI_CLOUD || ''
    : process.env.MONGO_URI_CLOUD || '';
console.log(`Environment: ${process.env.NODE_ENV}`);
(0, connection_1.default)(MONGO_URI).then(() => {
    app_1.server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
