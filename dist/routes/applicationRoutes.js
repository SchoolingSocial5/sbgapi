"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const applicationController_1 = require("../controllers/applicationController");
const router = express_1.default.Router();
router.route('/search').get(applicationController_1.searchApplications);
router.route('/:id').get(applicationController_1.getApplication).patch(upload.any(), applicationController_1.updateApplication).delete(applicationController_1.deleteApplication);
router.route('/').get(applicationController_1.getApplications).post(upload.any(), applicationController_1.createApplication);
router.route('/mass-delete').patch(upload.any(), applicationController_1.deleteApplications);
exports.default = router;
