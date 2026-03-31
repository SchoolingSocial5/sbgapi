"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const marketingController_1 = require("../controllers/marketingController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(marketingController_1.searchMarketings);
router.route('/:id').get(marketingController_1.getMarketing).patch(upload.any(), marketingController_1.updateMarketing).delete(upload.any(), marketingController_1.deleteMarketing);
router.route('/').get(marketingController_1.getMarketings).post(upload.any(), marketingController_1.createMarketing);
exports.default = router;
