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
exports.getStaffs = exports.MakeStaffUsers = exports.MakeUserStaff = void 0;
const query_1 = require("../utils/query");
const errorHandler_1 = require("../utils/errorHandler");
const userModel_1 = require("../models/users/userModel");
const staffModel_1 = require("../models/staffModel");
const MakeUserStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findByIdAndUpdate(req.body.id, { status: 'Staff' }, { new: true });
        yield staffModel_1.Staff.create({
            username: user.username,
            name: user.fullName,
            picture: user.picture,
            phone: user.phone,
            email: user.email,
        });
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json({
            message: 'The user has successfully been made staff.',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.MakeUserStaff = MakeUserStaff;
const MakeStaffUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staffModel_1.Staff.findByIdAndDelete(req.body.id);
        yield userModel_1.User.findOneAndUpdate({
            username: staff.username,
        }, { status: 'User' });
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json({
            message: 'The User has been successfully made a user.',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.MakeStaffUsers = MakeStaffUsers;
const getStaffs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(staffModel_1.Staff, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getStaffs = getStaffs;
