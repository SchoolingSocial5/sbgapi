"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const transactionController_1 = require("../controllers/transactionController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/mass-delete').patch(upload.any(), transactionController_1.massDeleteTrasanction);
router.route('/').get(transactionController_1.getTransactions).post(upload.any(), transactionController_1.createTrasanction);
router.route('/purchase').post(transactionController_1.purchaseProducts);
router.route('/barchart').get(transactionController_1.GetTransactionSummary);
router.route('/part-payment/:id').patch(upload.any(), transactionController_1.updatePartPayment);
router.route('/:id').patch(upload.any(), transactionController_1.updateTransaction);
exports.default = router;
