"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestExpenses = exports.getExpenses = exports.updateExpense = exports.getExpense = exports.createExpense = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const expenseModel_1 = require("../models/expenseModel");
const app_1 = require("../app");
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const expenses = yield expenseModel_1.Expense.create(req.body);
        const result = yield (0, query_1.queryData)(expenseModel_1.Expense, req);
        app_1.io.emit("expenses", { expenses });
        res.status(200).json({
            message: 'Expense was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createExpense = createExpense;
const getExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expense = yield expenseModel_1.Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'expense not found' });
        }
        res.status(200).json({ data: expense });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getExpense = getExpense;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const expense = yield expenseModel_1.Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!expense) {
            return res.status(404).json({ message: 'expense not found' });
        }
        const result = yield (0, query_1.queryData)(expenseModel_1.Expense, req);
        res.status(200).json({
            message: 'The expense is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateExpense = updateExpense;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(expenseModel_1.Expense, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getExpenses = getExpenses;
const getLatestExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield expenseModel_1.Expense.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5);
        res.status(200).json({
            success: true,
            count: expenses.length,
            results: expenses,
        });
    }
    catch (error) {
        console.error("Error fetching latest expenses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest expenses",
        });
    }
});
exports.getLatestExpenses = getLatestExpenses;
