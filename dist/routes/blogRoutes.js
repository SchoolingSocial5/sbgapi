"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const blogController_1 = require("../controllers/blogController");
const router = express_1.default.Router();
router.route('/search').get(blogController_1.searchBlogs);
router.route('/:id').get(blogController_1.getABlog).patch(upload.any(), blogController_1.updateBlog).delete(upload.any(), blogController_1.deleteBlog);
router.route('/').get(blogController_1.getBlogs).post(upload.any(), blogController_1.createBlog);
router.route('/mass-delete').patch(upload.any(), blogController_1.deleteBlogs);
exports.default = router;
