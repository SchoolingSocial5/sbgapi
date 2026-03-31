"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const equipmentController_1 = require("../controllers/equipmentController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(equipmentController_1.searchEquipments);
router.route('/:id').get(equipmentController_1.getEquipment).patch(upload.any(), equipmentController_1.updateEquipment);
router.route('/').get(equipmentController_1.getEquipments).post(upload.any(), equipmentController_1.createEquipment);
exports.default = router;
