"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const visitorController_1 = require("../controllers/visitorController");
const activityController_1 = require("../controllers/activityController");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route('/activities').get(activityController_1.getActivities);
router.route('/search').get(visitorController_1.searchVisitors);
router.route('/:id').get(visitorController_1.getVisitor).patch(upload.any(), visitorController_1.updateVisitor);
router.route('/').get(visitorController_1.getVisitors).post(upload.any(), visitorController_1.createVisitor);
exports.default = router;
