"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const mortalityController_1 = require("../controllers/mortalityController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(mortalityController_1.searchMortalities);
router.route('/:id').get(mortalityController_1.getMortality).patch(upload.any(), mortalityController_1.updateMortality);
router.route('/').get(mortalityController_1.getMortalities).post(upload.any(), mortalityController_1.createMortality);
exports.default = router;
