"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const personalMessageController_1 = require("../../controllers/message/personalMessageController");
const router = express_1.default.Router();
router.route('/personal').get(personalMessageController_1.getPersonalMessages);
router.route('/personal/read').patch(upload.any(), personalMessageController_1.readPersonalMessages);
router.route('/personal/:id').get(personalMessageController_1.getPersonalMessage);
exports.default = router;
