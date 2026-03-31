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
exports.getConsumptionSummary = exports.getSalarySummary = exports.getPurchasesSummary = exports.getSalesSummary = exports.getExpensesSummary = void 0;
const expenseModel_1 = require("../models/expenseModel");
const transactionModel_1 = require("../models/transactionModel");
const salaryModel_1 = require("../models/salaryModel");
const consumptionModel_1 = require("../models/consumptionModel");
const getExpensesSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const result = yield expenseModel_1.Expense.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalDocuments: { $sum: 1 },
                },
            },
        ]);
        const summary = result[0] || {
            totalAmount: 0,
            totalDocuments: 0,
        };
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
});
exports.getExpensesSummary = getExpensesSummary;
const getSalesSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // include full end day
        const result = yield transactionModel_1.Transaction.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to,
                    },
                    isProfit: true,
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalDocuments: { $sum: 1 },
                },
            },
        ]);
        const summary = result[0] || {
            totalAmount: 0,
            totalDocuments: 0,
        };
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
});
exports.getSalesSummary = getSalesSummary;
const getPurchasesSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // include full end day
        const result = yield transactionModel_1.Transaction.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to,
                    },
                    isProfit: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalDocuments: { $sum: 1 },
                },
            },
        ]);
        const summary = result[0] || {
            totalAmount: 0,
            totalDocuments: 0,
        };
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
});
exports.getPurchasesSummary = getPurchasesSummary;
const getSalarySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // include full end day
        const result = yield salaryModel_1.Salary.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalDocuments: { $sum: 1 },
                },
            },
        ]);
        const summary = result[0] || {
            totalAmount: 0,
            totalDocuments: 0,
        };
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
});
exports.getSalarySummary = getSalarySummary;
const getConsumptionSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // include full end day
        const result = yield consumptionModel_1.Consumption.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: from,
                        $lte: to,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalDocuments: { $sum: 1 },
                },
            },
        ]);
        const summary = result[0] || {
            totalAmount: 0,
            totalDocuments: 0,
        };
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
});
exports.getConsumptionSummary = getConsumptionSummary;
