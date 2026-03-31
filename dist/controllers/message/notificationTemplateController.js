"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationTemplate = exports.massDeleteNotificationTemplates = exports.updateNotificationTemplate = exports.getNotificationTemplates = exports.getNotificationTemplateById = exports.createNotificationTemplate = void 0;
const errorHandler_1 = require("../../utils/errorHandler");
const query_1 = require("../../utils/query");
const notificationTemplateModel_1 = require("../../models/message/notificationTemplateModel");
//-----------------NOTIFICATION--------------------//
const createNotificationTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, query_1.createItem)(req, res, notificationTemplateModel_1.NotificationTemplate, 'Notification was created successfully');
});
exports.createNotificationTemplate = createNotificationTemplate;
const getNotificationTemplateById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield notificationTemplateModel_1.NotificationTemplate.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ data: item });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getNotificationTemplateById = getNotificationTemplateById;
const getNotificationTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(notificationTemplateModel_1.NotificationTemplate, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getNotificationTemplates = getNotificationTemplates;
const updateNotificationTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, query_1.updateItem)(req, res, notificationTemplateModel_1.NotificationTemplate, [], ['Notification not found', 'Notification was updated successfully']);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateNotificationTemplate = updateNotificationTemplate;
const massDeleteNotificationTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (let i = 0; i < req.body.length; i++) {
            const el = req.body[i];
            yield notificationTemplateModel_1.NotificationTemplate.findByIdAndDelete(el._id);
        }
        const result = yield (0, query_1.queryData)(notificationTemplateModel_1.NotificationTemplate, req);
        res.status(200).json({
            message: 'The notification templates are delted successfully.',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.massDeleteNotificationTemplates = massDeleteNotificationTemplates;
const deleteNotificationTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, query_1.deleteItem)(req, res, notificationTemplateModel_1.NotificationTemplate, [], 'Notification not found');
});
exports.deleteNotificationTemplate = deleteNotificationTemplate;
