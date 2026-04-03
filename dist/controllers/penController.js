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
exports.searchPens = exports.deletePen = exports.getPens = exports.updatePen = exports.getPen = exports.createPen = void 0;
const query_1 = require("../utils/query");
const errorHandler_1 = require("../utils/errorHandler");
const penModel_1 = require("../models/penModel");
const createPen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield penModel_1.Pen.create(req.body);
        const result = yield (0, query_1.queryData)(penModel_1.Pen, req);
        res.status(200).json({
            message: 'Pen was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createPen = createPen;
const getPen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pen = yield penModel_1.Pen.findById(req.params.id);
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' });
        }
        res.status(200).json({ data: pen });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getPen = getPen;
const updatePen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pen = yield penModel_1.Pen.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' });
        }
        const result = yield (0, query_1.queryData)(penModel_1.Pen, req);
        res.status(200).json({
            message: 'The Pen is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updatePen = updatePen;
const getPens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(penModel_1.Pen, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getPens = getPens;
const deletePen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pen = yield penModel_1.Pen.findByIdAndDelete(req.params.id);
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' });
        }
        const result = yield (0, query_1.queryData)(penModel_1.Pen, req);
        res.status(200).json({
            message: 'Pen deleted successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deletePen = deletePen;
const searchPens = (req, res) => {
    return (0, query_1.search)(penModel_1.Pen, req, res);
};
exports.searchPens = searchPens;
