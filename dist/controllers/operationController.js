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
exports.searchOperations = exports.getOperations = exports.updateOperation = exports.getOperation = exports.createOperation = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const operationModel_1 = require("../models/operationModel");
const createOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield operationModel_1.Operation.create(req.body);
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json({
            message: 'Operation was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createOperation = createOperation;
const getOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operation = yield operationModel_1.Operation.findById(req.params.id);
        if (!operation) {
            return res.status(404).json({ message: 'operation not found' });
        }
        res.status(200).json({ data: operation });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getOperation = getOperation;
const updateOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const service = yield operationModel_1.Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({ message: 'service not found' });
        }
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json({
            message: 'The operation is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateOperation = updateOperation;
const getOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getOperations = getOperations;
const searchOperations = (req, res) => {
    return (0, query_1.search)(operationModel_1.Operation, req, res);
};
exports.searchOperations = searchOperations;
