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
exports.searchRatings = exports.deleteReviews = exports.getRatings = exports.updateRating = exports.getRating = exports.createRating = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const ratingModel_1 = require("../models/ratingModel");
const createRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield ratingModel_1.Rating.create(req.body);
        const result = yield (0, query_1.queryData)(ratingModel_1.Rating, req);
        res.status(200).json({
            message: 'Rating was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createRating = createRating;
const getRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rating = yield ratingModel_1.Rating.findOne({ username: req.params.username });
        if (!rating) {
            return res.status(200).json();
        }
        else {
            res.status(200).json({ data: rating });
        }
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getRating = getRating;
const updateRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const rating = yield ratingModel_1.Rating.findOneAndUpdate({ username: req.params.username }, req.body, {
            new: true,
            runValidators: true,
            upsert: true,
        });
        const result = yield (0, query_1.queryData)(ratingModel_1.Rating, req);
        res.status(200).json(Object.assign({ message: 'The rating is updated successfully', data: rating }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateRating = updateRating;
const getRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(ratingModel_1.Rating, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getRatings = getRatings;
const deleteReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = req.body.ids;
        for (let x = 0; x < ids.length; x++) {
            const id = ids[x];
            yield ratingModel_1.Rating.findByIdAndDelete(id);
        }
        const result = yield (0, query_1.queryData)(ratingModel_1.Rating, req);
        res.status(200).json(Object.assign({ message: 'Rating report deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteReviews = deleteReviews;
const searchRatings = (req, res) => {
    return (0, query_1.search)(ratingModel_1.Rating, req, res);
};
exports.searchRatings = searchRatings;
