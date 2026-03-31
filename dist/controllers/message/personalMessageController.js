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
exports.getPersonalMessage = exports.getPersonalMessages = exports.readPersonalMessages = void 0;
const errorHandler_1 = require("../../utils/errorHandler");
const query_1 = require("../../utils/query");
const personalMessageModel_1 = require("../../models/message/personalMessageModel");
const readPersonalMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = JSON.parse(req.body.ids);
        yield personalMessageModel_1.PersonalMessage.updateMany({ _id: { $in: ids } }, {
            $set: {
                unread: false,
            },
        });
        const unread = yield personalMessageModel_1.PersonalMessage.countDocuments({
            receiverUsername: req.query.username,
            unread: true,
        });
        res.status(200).json({
            unread,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.readPersonalMessages = readPersonalMessages;
const getPersonalMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(personalMessageModel_1.PersonalMessage, req);
        const unread = yield personalMessageModel_1.PersonalMessage.countDocuments({
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
exports.getPersonalMessages = getPersonalMessages;
const getPersonalMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield personalMessageModel_1.PersonalMessage.findById(req.params.id);
        res.status(200).json({
            data: result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getPersonalMessage = getPersonalMessage;
