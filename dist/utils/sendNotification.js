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
exports.sendNotification = void 0;
const notificationModel_1 = require("../models/message/notificationModel");
const notificationTemplateModel_1 = require("../models/message/notificationTemplateModel");
const helper_1 = require("./helper");
const sendNotification = (templateName, data) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationTemp = yield notificationTemplateModel_1.NotificationTemplate.findOne({
        name: templateName,
    });
    if (!notificationTemp) {
        throw new Error(`Notification template '${templateName}' not found.`);
    }
    const content = notificationTemp.content
        .replace('{{username}}', data.user.username)
        .replace('{{full_name}}', data.user.fullName)
        .replace('{{part_payment}}', (0, helper_1.formatMoney)(data.transaction.partPayment))
        .replace('{{total_payment}}', (0, helper_1.formatMoney)(data.transaction.totalAmount))
        .replace('{{total_amount}}', (0, helper_1.formatMoney)(data.transaction.totalAmount))
        .replace('{{remaining_payment}}', (0, helper_1.formatMoney)(data.transaction.totalAmount - data.transaction.partPayment));
    const notification = yield notificationModel_1.Notification.create({
        greetings: notificationTemp.greetings,
        name: notificationTemp.name,
        title: notificationTemp.title,
        username: data.user.username,
        fullName: data.user.fullName,
        picture: data.user.picture,
        content,
    });
    const unread = yield notificationModel_1.Notification.countDocuments({
        unread: true,
    });
    return { notification, unread };
});
exports.sendNotification = sendNotification;
