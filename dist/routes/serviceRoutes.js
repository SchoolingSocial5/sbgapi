"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const serviceController_1 = require("../controllers/serviceController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(serviceController_1.searchServices);
router.route('/:id').get(serviceController_1.getService).patch(upload.any(), serviceController_1.updateService);
router.route('/').get(serviceController_1.getServices).post(upload.any(), serviceController_1.createService);
exports.default = router;
