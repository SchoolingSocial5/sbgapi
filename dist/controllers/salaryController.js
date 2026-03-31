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
exports.getLatestSalaries = exports.getSalaries = exports.updateSalary = exports.getSalary = exports.createSalary = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const app_1 = require("../app");
const salaryModel_1 = require("../models/salaryModel");
const createSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const salaries = yield salaryModel_1.Salary.create(req.body);
        const result = yield (0, query_1.queryData)(salaryModel_1.Salary, req);
        app_1.io.emit("salaries", { salaries });
        res.status(200).json({
            message: 'Salarie was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createSalary = createSalary;
const getSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salary = yield salaryModel_1.Salary.findById(req.params.id);
        if (!salary) {
            return res.status(404).json({ message: 'Salary not found' });
        }
        res.status(200).json({ data: salary });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getSalary = getSalary;
const updateSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const salary = yield salaryModel_1.Salary.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!salary) {
            return res.status(404).json({ message: 'Salary not found' });
        }
        const result = yield (0, query_1.queryData)(salaryModel_1.Salary, req);
        res.status(200).json({
            message: 'The Salary is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateSalary = updateSalary;
const getSalaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(salaryModel_1.Salary, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getSalaries = getSalaries;
const getLatestSalaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salaries = yield salaryModel_1.Salary.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5);
        res.status(200).json({
            success: true,
            count: salaries.length,
            results: salaries,
        });
    }
    catch (error) {
        console.error("Error fetching latest Salaries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest Salaries",
        });
    }
});
exports.getLatestSalaries = getLatestSalaries;
