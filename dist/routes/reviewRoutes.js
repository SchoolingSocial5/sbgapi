"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const reviewController_1 = require("../controllers/reviewController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(reviewController_1.searchRatings);
router.route('/mass-delete').patch(reviewController_1.deleteReviews);
router.route('/:username').get(reviewController_1.getRating).patch(upload.any(), reviewController_1.updateRating);
router.route('/').get(reviewController_1.getRatings).post(upload.any(), reviewController_1.createRating);
exports.default = router;
