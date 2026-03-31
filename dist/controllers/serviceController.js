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
exports.searchServices = exports.getServices = exports.updateService = exports.getService = exports.createService = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const serviceModel_1 = require("../models/serviceModel");
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield serviceModel_1.Service.create(req.body);
        const result = yield (0, query_1.queryData)(serviceModel_1.Service, req);
        res.status(200).json({
            message: 'Service was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createService = createService;
const getService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield serviceModel_1.Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'service not found' });
        }
        res.status(200).json({ data: service });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getService = getService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const service = yield serviceModel_1.Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({ message: 'service not found' });
        }
        const result = yield (0, query_1.queryData)(serviceModel_1.Service, req);
        res.status(200).json({
            message: 'The service is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateService = updateService;
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(serviceModel_1.Service, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getServices = getServices;
const searchServices = (req, res) => {
    return (0, query_1.search)(serviceModel_1.Service, req, res);
};
exports.searchServices = searchServices;
