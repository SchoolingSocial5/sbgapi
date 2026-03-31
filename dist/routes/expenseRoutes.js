"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const expenseController_1 = require("../controllers/expenseController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/latest').get(expenseController_1.getLatestExpenses);
router.route('/:id').get(expenseController_1.getExpense).patch(upload.any(), expenseController_1.updateExpense);
router.route('/').get(expenseController_1.getExpenses).post(upload.any(), expenseController_1.createExpense);
exports.default = router;
