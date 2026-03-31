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
exports.deleteEmails = exports.updateEmail = exports.sendEmailToUsers = exports.getEmails = exports.getEmailById = exports.createEmail = void 0;
const emailModel_1 = require("../../models/message/emailModel");
const errorHandler_1 = require("../../utils/errorHandler");
const query_1 = require("../../utils/query");
const sendEmail_1 = require("../../utils/sendEmail");
const createEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, query_1.createItem)(req, res, emailModel_1.Email, 'Email was created successfully');
});
exports.createEmail = createEmail;
const getEmailById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield emailModel_1.Email.findById(req.params.id);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        res.status(200).json(email);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getEmailById = getEmailById;
const getEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(emailModel_1.Email, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getEmails = getEmails;
const sendEmailToUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = req.body.selectedUsers;
        const email = yield emailModel_1.Email.findById(req.params.id);
        if (!email) {
            return res.status(404).json({ message: 'Email template not found.' });
        }
        const failedUsers = [];
        for (const user of users) {
            try {
                const isEmailSent = yield (0, sendEmail_1.sendEmail)(String(user.username), user.email, email.name);
                if (!isEmailSent) {
                    failedUsers.push({
                        username: String(user.username),
                        email: user.email,
                        error: 'sendEmail returned false',
                    });
                }
            }
            catch (err) {
                failedUsers.push({
                    username: String(user.username),
                    email: user.email,
                    error: err.message || 'Unknown error',
                });
            }
        }
        if (failedUsers.length === 0) {
            return res.status(200).json({
                message: 'All emails sent successfully.',
                totalUsers: users.length,
            });
        }
        else {
            return res.status(207).json({
                message: 'Some emails failed to send.',
                failed: failedUsers,
                totalSuccess: users.length - failedUsers.length,
                totalFailed: failedUsers.length,
            });
        }
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.sendEmailToUsers = sendEmailToUsers;
const updateEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield emailModel_1.Email.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        const item = yield (0, query_1.queryData)(emailModel_1.Email, req);
        const { page, page_size, count, results } = item;
        res.status(200).json({
            message: 'Email was updated successfully',
            results,
            count,
            page,
            page_size,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateEmail = updateEmail;
const deleteEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (let i = 0; i < req.body.length; i++) {
            const el = req.body[i];
            yield emailModel_1.Email.findByIdAndDelete(el._id);
        }
        const result = yield (0, query_1.queryData)(emailModel_1.Email, req);
        res.status(200).json(Object.assign({ message: 'Emails deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteEmails = deleteEmails;
