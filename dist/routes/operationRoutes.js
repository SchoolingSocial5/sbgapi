"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const operationController_1 = require("../controllers/operationController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(operationController_1.searchOperations);
router.route('/:id').get(operationController_1.getOperation).patch(upload.any(), operationController_1.updateOperation);
router.route('/').get(operationController_1.getOperations).post(upload.any(), operationController_1.createOperation);
exports.default = router;
