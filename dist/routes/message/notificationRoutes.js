"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const notificationController_1 = require("../../controllers/message/notificationController");
const notificationTemplateController_1 = require("../../controllers/message/notificationTemplateController");
const router = express_1.default.Router();
router
    .route('/templates')
    .get(notificationTemplateController_1.getNotificationTemplates)
    .post(upload.any(), notificationTemplateController_1.createNotificationTemplate);
router
    .route('/templates/:id')
    .get(notificationTemplateController_1.getNotificationTemplateById)
    .patch(upload.any(), notificationTemplateController_1.updateNotificationTemplate)
    .delete(notificationTemplateController_1.deleteNotificationTemplate);
router.route('/personal/read').patch(upload.any(), notificationController_1.readPersonalNotifications);
router.route('/personal').get(notificationController_1.getPersonalNotifications);
router.route('/personal/:id').get(notificationController_1.getPersonalNotification);
router.route('/social/read').patch(upload.any(), notificationController_1.readSocialNotifications);
router.route('/social').get(notificationController_1.getSocialNotifications);
router.route('/social/:id').get(notificationController_1.getSocialNotification);
router.route('/push-notification').patch(upload.any(), notificationController_1.sendPushNotification);
exports.default = router;
