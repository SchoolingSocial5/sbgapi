"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const salaryController_1 = require("../controllers/salaryController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/latest').get(salaryController_1.getLatestSalaries);
router.route('/:id').get(salaryController_1.getSalary).patch(upload.any(), salaryController_1.updateSalary);
router.route('/').get(salaryController_1.getSalaries).post(upload.any(), salaryController_1.createSalary);
exports.default = router;
