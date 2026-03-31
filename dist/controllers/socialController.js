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
exports.searchSocials = exports.deleteSocial = exports.getSocials = exports.updateSocial = exports.getSocial = exports.createSocial = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const socialModel_1 = require("../models/socialModel");
const createSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield socialModel_1.Social.create(req.body);
        const result = yield (0, query_1.queryData)(socialModel_1.Social, req);
        res.status(200).json({
            message: 'Social was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createSocial = createSocial;
const getSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const social = yield socialModel_1.Social.findById(req.params.id);
        if (!social) {
            return res.status(404).json({ message: 'Social not found' });
        }
        res.status(200).json({ data: social });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getSocial = getSocial;
const updateSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const social = yield socialModel_1.Social.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!social) {
            return res.status(404).json({ message: 'Social not found' });
        }
        const result = yield (0, query_1.queryData)(socialModel_1.Social, req);
        res.status(200).json({
            message: 'The Social is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateSocial = updateSocial;
const getSocials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(socialModel_1.Social, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getSocials = getSocials;
const deleteSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield socialModel_1.Social.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Social report not found' });
        }
        const result = yield (0, query_1.queryData)(socialModel_1.Social, req);
        res.status(200).json(Object.assign({ message: 'Social report deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteSocial = deleteSocial;
const searchSocials = (req, res) => {
    return (0, query_1.search)(socialModel_1.Social, req, res);
};
exports.searchSocials = searchSocials;
