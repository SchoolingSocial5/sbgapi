"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const strategyController_1 = require("../controllers/strategyController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(strategyController_1.searchStrategies);
router.route('/:id').get(strategyController_1.getStrategy).patch(upload.any(), strategyController_1.updateStrategy).delete(upload.any(), strategyController_1.deleteStrategy);
router.route('/').get(strategyController_1.getStrategies).post(upload.any(), strategyController_1.createStrategy);
exports.default = router;
