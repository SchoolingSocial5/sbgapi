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
exports.searchEquipments = exports.getEquipments = exports.updateEquipment = exports.getEquipment = exports.createEquipment = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const equipmentModel_1 = require("../models/equipmentModel");
const createEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield equipmentModel_1.Equipment.create(req.body);
        const result = yield (0, query_1.queryData)(equipmentModel_1.Equipment, req);
        res.status(200).json({
            message: 'Equipment was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createEquipment = createEquipment;
const getEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipment = yield equipmentModel_1.Equipment.findOne({ username: req.params.username });
        if (!equipment) {
            return res.status(200).json();
        }
        else {
            res.status(200).json({ data: equipment });
        }
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getEquipment = getEquipment;
const updateEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield equipmentModel_1.Equipment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            upsert: true,
        });
        const result = yield (0, query_1.queryData)(equipmentModel_1.Equipment, req);
        res.status(200).json({
            message: 'The Equipment is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateEquipment = updateEquipment;
const getEquipments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(equipmentModel_1.Equipment, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getEquipments = getEquipments;
const searchEquipments = (req, res) => {
    return (0, query_1.search)(equipmentModel_1.Equipment, req, res);
};
exports.searchEquipments = searchEquipments;
