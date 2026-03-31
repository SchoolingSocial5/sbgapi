import { Request, Response } from "express";
import { Expense } from "../models/expenseModel";
import { Transaction } from "../models/transactionModel";
import { Salary } from "../models/salaryModel";
import { Consumption } from "../models/consumptionModel";

export const getExpensesSummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }

        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);

        const result = await Expense.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
};

export const getSalesSummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }

        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999); // include full end day

        const result = await Transaction.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
};

export const getPurchasesSummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }

        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999); // include full end day

        const result = await Transaction.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
};

export const getSalarySummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }

        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999); // include full end day

        const result = await Salary.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
};

export const getConsumptionSummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query;

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                message: "dateFrom and dateTo are required",
            });
        }

        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999); // include full end day

        const result = await Consumption.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error,
        });
    }
};