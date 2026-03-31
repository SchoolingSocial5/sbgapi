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
exports.searchVisitors = exports.getVisitors = exports.updateVisitor = exports.getVisitor = exports.createVisitor = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const visitorModel_1 = require("../models/visitorModel");
const createVisitor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield visitorModel_1.Visitor.create(req.body);
        const result = yield (0, query_1.queryData)(visitorModel_1.Visitor, req);
        res.status(200).json({
            message: 'Visitor was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createVisitor = createVisitor;
const getVisitor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const visitor = yield visitorModel_1.Visitor.findOne({ username: req.params.username });
        if (!visitor) {
            return res.status(200).json();
        }
        else {
            res.status(200).json({ data: visitor });
        }
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getVisitor = getVisitor;
const updateVisitor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield visitorModel_1.Visitor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            upsert: true,
        });
        const result = yield (0, query_1.queryData)(visitorModel_1.Visitor, req);
        res.status(200).json({
            message: 'The Visitor is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateVisitor = updateVisitor;
const getVisitors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(visitorModel_1.Visitor, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getVisitors = getVisitors;
const searchVisitors = (req, res) => {
    return (0, query_1.search)(visitorModel_1.Visitor, req, res);
};
exports.searchVisitors = searchVisitors;
