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
exports.searchApplications = exports.deleteApplications = exports.deleteApplication = exports.getApplications = exports.updateApplication = exports.getApplication = exports.createApplication = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const applicationModel_1 = require("../models/applicationModel");
const createApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield applicationModel_1.Application.create(req.body);
        const result = yield (0, query_1.queryData)(applicationModel_1.Application, req);
        res.status(200).json({
            message: 'You application has been submitted successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createApplication = createApplication;
const getApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const application = yield applicationModel_1.Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'application not found' });
        }
        res.status(200).json({ data: application });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getApplication = getApplication;
const updateApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const application = yield applicationModel_1.Application.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!application) {
            return res.status(404).json({ message: 'application not found' });
        }
        res.status(200).json({
            message: 'The application is updated successfully',
            data: application,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateApplication = updateApplication;
const getApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(applicationModel_1.Application, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getApplications = getApplications;
const deleteApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const application = yield applicationModel_1.Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'application not found' });
        }
        const result = yield (0, query_1.queryData)(applicationModel_1.Application, req);
        res.status(200).json(Object.assign({ message: 'Application deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteApplication = deleteApplication;
const deleteApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = req.body.selectedUsers;
        for (const e of applications) {
            yield applicationModel_1.Application.findByIdAndDelete(e._id);
        }
        const result = yield (0, query_1.queryData)(applicationModel_1.Application, req);
        return res.status(207).json({
            message: 'The applications were deleted successfully.',
            result
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteApplications = deleteApplications;
const searchApplications = (req, res) => {
    return (0, query_1.search)(applicationModel_1.Application, req, res);
};
exports.searchApplications = searchApplications;
