"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const emailController_1 = require("../controllers/message/emailController");
const notificationTemplateController_1 = require("../controllers/message/notificationTemplateController");
const router = express_1.default.Router();
router.route('/mass-delete').patch(upload.any(), emailController_1.deleteEmails);
router.route('/').get(emailController_1.getEmails).post(upload.any(), emailController_1.createEmail);
router.route('/send/:id').patch(upload.any(), emailController_1.sendEmailToUsers);
router
    .route('/templates')
    .get(notificationTemplateController_1.getNotificationTemplates)
    .post(upload.any(), notificationTemplateController_1.createNotificationTemplate);
router
    .route('/templates/:id')
    .get(notificationTemplateController_1.getNotificationTemplateById)
    .patch(upload.any(), notificationTemplateController_1.updateNotificationTemplate);
router
    .route('/:id')
    .get(emailController_1.getEmailById)
    .patch(upload.any(), emailController_1.updateEmail);
exports.default = router;
