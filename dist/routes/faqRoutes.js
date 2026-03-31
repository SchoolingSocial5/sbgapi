"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const faqController_1 = require("../controllers/faqController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(faqController_1.searchFaqs);
router.route('/:id').get(faqController_1.getFaq).patch(upload.any(), faqController_1.updateFaq);
router.route('/').get(faqController_1.getFaqs).post(upload.any(), faqController_1.createFaq);
exports.default = router;
