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
exports.readNotifications = exports.getNotification = exports.getNotifications = void 0;
const errorHandler_1 = require("../../utils/errorHandler");
const notificationModel_1 = require("../../models/message/notificationModel");
const query_1 = require("../../utils/query");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(notificationModel_1.Notification, req);
        const unread = yield notificationModel_1.Notification.countDocuments({
            receiverUsername: req.query.receiverUsername,
            unread: true,
        });
        res.status(200).json({
            page: result.page,
            page_size: result.page_size,
            results: result.results,
            count: result.count,
            unread: unread,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getNotifications = getNotifications;
const getNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield notificationModel_1.Notification.findById(req.params.id);
        const unread = yield notificationModel_1.Notification.countDocuments({ unread: true });
        res.status(200).json({ data: result, unread });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getNotification = getNotification;
const readNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = req.body.ids;
        console.log(ids);
        yield notificationModel_1.Notification.updateMany({ _id: { $in: ids } }, { $set: { unread: false } });
        const unread = yield notificationModel_1.Notification.countDocuments({
            unread: true,
        });
        res.status(200).json({
            unread: unread,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.readNotifications = readNotifications;
