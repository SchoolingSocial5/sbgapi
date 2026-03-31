"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const summaryController_1 = require("../controllers/summaryController");
const router = express_1.default.Router();
router.route('/expenses').get(summaryController_1.getExpensesSummary);
router.route('/sales').get(summaryController_1.getSalesSummary);
router.route('/purchases').get(summaryController_1.getPurchasesSummary);
router.route('/salaries').get(summaryController_1.getSalarySummary);
router.route('/consumptions').get(summaryController_1.getConsumptionSummary);
exports.default = router;
