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
exports.searchColumns = exports.deleteColumn = exports.getColumns = exports.updateColumn = exports.getColumn = exports.createColumn = void 0;
const query_1 = require("../utils/query");
const errorHandler_1 = require("../utils/errorHandler");
const columnModel_1 = require("../models/columnModel");
const createColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield columnModel_1.Column.create(req.body);
        const result = yield (0, query_1.queryData)(columnModel_1.Column, req);
        res.status(200).json({
            message: 'Column was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createColumn = createColumn;
const getColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const column = yield columnModel_1.Column.findById(req.params.id);
        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }
        res.status(200).json({ data: column });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getColumn = getColumn;
const updateColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const column = yield columnModel_1.Column.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }
        const result = yield (0, query_1.queryData)(columnModel_1.Column, req);
        res.status(200).json({
            message: 'The Column is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateColumn = updateColumn;
const getColumns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(columnModel_1.Column, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getColumns = getColumns;
const deleteColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const column = yield columnModel_1.Column.findByIdAndDelete(req.params.id);
        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }
        const result = yield (0, query_1.queryData)(columnModel_1.Column, req);
        res.status(200).json({
            message: 'Column deleted successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteColumn = deleteColumn;
const searchColumns = (req, res) => {
    return (0, query_1.search)(columnModel_1.Column, req, res);
};
exports.searchColumns = searchColumns;
