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
exports.searchBlogs = exports.deleteBlogs = exports.deleteBlog = exports.getBlogs = exports.updateBlog = exports.getABlog = exports.createBlog = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const blogModel_1 = require("../models/blogModel");
const createBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield blogModel_1.Blog.create(req.body);
        const result = yield (0, query_1.queryData)(blogModel_1.Blog, req);
        res.status(200).json({
            message: 'Blog was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createBlog = createBlog;
const getABlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blogModel_1.Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }
        res.status(200).json({ data: blog });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getABlog = getABlog;
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const blog = yield blogModel_1.Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }
        res.status(200).json({
            message: 'The blog is updated successfully',
            data: blog,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateBlog = updateBlog;
const getBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(blogModel_1.Blog, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getBlogs = getBlogs;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blogModel_1.Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'blog not found' });
        }
        const result = yield (0, query_1.queryData)(blogModel_1.Blog, req);
        res.status(200).json(Object.assign({ message: 'Blog deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteBlog = deleteBlog;
const deleteBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = req.body.selectedUsers;
        for (const e of blogs) {
            yield blogModel_1.Blog.findByIdAndDelete(e._id);
        }
        const result = yield (0, query_1.queryData)(blogModel_1.Blog, req);
        return res.status(207).json({
            message: 'The blogs were deleted successfully.',
            result
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteBlogs = deleteBlogs;
const searchBlogs = (req, res) => {
    return (0, query_1.search)(blogModel_1.Blog, req, res);
};
exports.searchBlogs = searchBlogs;
