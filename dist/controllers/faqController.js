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
exports.searchFaqs = exports.getFaqs = exports.updateFaq = exports.getFaq = exports.createFaq = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const faqModel_1 = require("../models/faqModel");
const createFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield faqModel_1.Faq.create(req.body);
        const result = yield (0, query_1.queryData)(faqModel_1.Faq, req);
        res.status(200).json({
            message: 'Faq was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createFaq = createFaq;
const getFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faqModel_1.Faq.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'faq not found' });
        }
        res.status(200).json({ data: faq });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getFaq = getFaq;
const updateFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const faq = yield faqModel_1.Faq.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!faq) {
            return res.status(404).json({ message: 'faq not found' });
        }
        const result = yield (0, query_1.queryData)(faqModel_1.Faq, req);
        res.status(200).json({
            message: 'The faq is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateFaq = updateFaq;
const getFaqs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(faqModel_1.Faq, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getFaqs = getFaqs;
const searchFaqs = (req, res) => {
    return (0, query_1.search)(faqModel_1.Faq, req, res);
};
exports.searchFaqs = searchFaqs;
