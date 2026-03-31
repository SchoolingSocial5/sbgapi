"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const authController_1 = require("../../controllers/users/authController");
const userController_1 = require("../../controllers/users/userController");
const router = express_1.default.Router();
router.route('/create-account');
router.route('/username/:username').get(userController_1.getExistingUsername);
router.route('/login').post(upload.any(), authController_1.loginUser);
router.route('/forgot-password').post(upload.any(), authController_1.forgottenPassword);
router.route('/reset-code').post(upload.any(), authController_1.validateResetCode);
router.route('/reset-password').post(upload.any(), authController_1.ResetPassword);
router.route('/auth').get(authController_1.getCurrentUser);
router.route('/suspend').patch(userController_1.suspendUsers);
router.route('/search').get(userController_1.searchAccounts);
router.route('/suspend').get(userController_1.searchAccounts);
router.route('/make-staff').patch(upload.any(), userController_1.MakeUserStaff);
router.route('/staff').patch(upload.any(), userController_1.updateUserStatus);
router
    .route('/:username')
    .get(userController_1.getAUser)
    .patch(upload.any(), userController_1.updateUser)
    .post(upload.any(), authController_1.updatePassword).delete(userController_1.deleteUser);
router.route('/make-user/:id').patch(upload.any(), userController_1.MakeStaffUser);
router.route('/').get(userController_1.getUsers).post(upload.any(), userController_1.createUser);
exports.default = router;
