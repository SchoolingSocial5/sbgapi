"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const socialController_1 = require("../controllers/socialController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/search').get(socialController_1.searchSocials);
router.route('/:id').get(socialController_1.getSocial).patch(upload.any(), socialController_1.updateSocial).delete(upload.any(), socialController_1.deleteSocial);
router.route('/').get(socialController_1.getSocials).post(upload.any(), socialController_1.createSocial);
exports.default = router;
