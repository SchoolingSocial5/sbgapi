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
exports.searchMarketings = exports.deleteMarketing = exports.getMarketings = exports.updateMarketing = exports.getMarketing = exports.createMarketing = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const marketingModel_1 = require("../models/marketingModel");
const createMarketing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield marketingModel_1.Marketing.create(req.body);
        const result = yield (0, query_1.queryData)(marketingModel_1.Marketing, req);
        res.status(200).json({
            message: 'Marketing was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createMarketing = createMarketing;
const getMarketing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const marketing = yield marketingModel_1.Marketing.findById(req.params.id);
        if (!marketing) {
            return res.status(404).json({ message: 'Marketing not found' });
        }
        res.status(200).json({ data: marketing });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getMarketing = getMarketing;
const updateMarketing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const marketing = yield marketingModel_1.Marketing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!marketing) {
            return res.status(404).json({ message: 'Marketing not found' });
        }
        const result = yield (0, query_1.queryData)(marketingModel_1.Marketing, req);
        res.status(200).json({
            message: 'The Marketing is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateMarketing = updateMarketing;
const getMarketings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(marketingModel_1.Marketing, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getMarketings = getMarketings;
const deleteMarketing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield marketingModel_1.Marketing.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Marketing report not found' });
        }
        const result = yield (0, query_1.queryData)(marketingModel_1.Marketing, req);
        res.status(200).json(Object.assign({ message: 'Marketing report deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteMarketing = deleteMarketing;
const searchMarketings = (req, res) => {
    return (0, query_1.search)(marketingModel_1.Marketing, req, res);
};
exports.searchMarketings = searchMarketings;
