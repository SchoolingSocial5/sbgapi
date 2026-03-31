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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingUsername = exports.deleteUser = exports.getUsers = exports.deleteMyData = exports.MakeStaffUser = exports.MakeUserStaff = exports.suspendUsers = exports.searchAccounts = exports.updateUserStatus = exports.updateUser = exports.getAUser = exports.createUser = void 0;
const errorHandler_1 = require("../../utils/errorHandler");
const query_1 = require("../../utils/query");
const fileUpload_1 = require("../../utils/fileUpload");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendEmail_1 = require("../../utils/sendEmail");
const userModel_1 = require("../../models/users/userModel");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = new userModel_1.User({
            email: req.body.email,
            username: req.body.username,
            phone: req.body.phone,
            fullName: req.body.fullName,
            password: yield bcryptjs_1.default.hash(req.body.password, 10),
        });
        yield newUser.save();
        yield (0, sendEmail_1.sendEmail)('', req.body.email, 'welcome');
        res.status(200).json({
            message: 'User created successfully',
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createUser = createUser;
const getAUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ data: user });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getAUser = getAUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const user = yield userModel_1.User.findOneAndUpdate({ username: req.params.username }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Your profile was updated successfully',
            data: user,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateUser = updateUser;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield userModel_1.User.findOneAndUpdate({ username: req.body.username }, req.body, {
            new: true,
            runValidators: true,
        });
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json({
            message: 'The user has been updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateUserStatus = updateUserStatus;
const searchAccounts = (req, res) => {
    return (0, query_1.search)(userModel_1.User, req, res);
};
exports.searchAccounts = searchAccounts;
const suspendUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = req.body.selectedUsers;
        for (const user of users) {
            yield userModel_1.User.findByIdAndUpdate(user._id, {
                $set: { isSuspended: !user.isSuspended }
            });
        }
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        return res.status(207).json({
            message: 'The users suspension status was updated successfully.',
            result
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.suspendUsers = suspendUsers;
const MakeUserStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield userModel_1.User.findByIdAndUpdate(req.body.id, { status: 'Staff', roles: "" }, { new: true });
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
const MakeStaffUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield userModel_1.User.findByIdAndUpdate(req.params.id, req.body);
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json({
            message: 'The staff has been successfully made a user.',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.MakeStaffUser = MakeStaffUser;
///////////// NEW CONTROLLERS //////////////
const deleteMyData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findById(req.params.id);
        yield userModel_1.User.findByIdAndDelete(req.params.id);
        return res
            .status(200)
            .json({ message: 'Your account has been deleted successfully.' });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteMyData = deleteMyData;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getUsers = getUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const result = yield (0, query_1.queryData)(userModel_1.User, req);
        res.status(200).json({ message: 'User deleted successfully', result });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteUser = deleteUser;
//-----------------INFO--------------------//
const getExistingUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findOne({ username: req.params.username });
        res.status(200).json(user);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getExistingUsername = getExistingUsername;
