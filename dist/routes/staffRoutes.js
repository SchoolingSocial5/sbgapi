"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const staffController_1 = require("../controllers/staffController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/make-staff').patch(upload.any(), staffController_1.MakeUserStaff);
router.route('/make-user').patch(staffController_1.MakeStaffUsers);
router.route('/').get(staffController_1.getStaffs);
exports.default = router;
