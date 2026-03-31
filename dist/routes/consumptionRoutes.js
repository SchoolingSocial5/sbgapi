"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const consumptionController_1 = require("../controllers/consumptionController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(consumptionController_1.searchConsumptions);
router.route('/:id').get(consumptionController_1.getConsumption).patch(upload.any(), consumptionController_1.updateConsumption);
router.route('/').get(consumptionController_1.getConsumptions).post(upload.any(), consumptionController_1.createConsumption);
exports.default = router;
