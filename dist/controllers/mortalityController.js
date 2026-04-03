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
exports.searchMortalities = exports.getMortalities = exports.updateMortality = exports.getMortality = exports.createMortality = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const mortalityModel_1 = require("../models/mortalityModel");
const productModel_1 = require("../models/productModel");
const app_1 = require("../app");
const createMortality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const productId = req.body.productId;
        const quantity = Number(req.body.birds || 0);
        const livestock = yield productModel_1.Product.findById(productId);
        if (!livestock) {
            return res.status(404).json({ message: 'Livestock product not found' });
        }
        // Stock Check
        if (livestock.units < quantity) {
            return res.status(400).json({
                message: `Insufficient stock for ${livestock.name}. Current stock: ${livestock.units}, Mortality: ${quantity}`
            });
        }
        // Decrement Stock
        yield productModel_1.Product.findByIdAndUpdate(productId, {
            $inc: { units: -1 * quantity },
        });
        // Cracks Product Logic: if the product name includes 'egg', track cracked eggs
        if (livestock.name.toLowerCase().includes('egg')) {
            const cracksProduct = yield productModel_1.Product.findOne({ pId: livestock._id });
            if (cracksProduct) {
                yield productModel_1.Product.findByIdAndUpdate(cracksProduct._id, {
                    $inc: { units: quantity },
                    picture: livestock.picture,
                    purchaseUnit: livestock.purchaseUnit,
                    unitPerPurchase: livestock.unitPerPurchase,
                });
            }
            else {
                yield productModel_1.Product.create({
                    name: `Cracks`,
                    pId: livestock._id,
                    units: quantity,
                    unitPerPurchase: livestock.unitPerPurchase || 1,
                    type: 'General',
                    isBuyable: true,
                    picture: livestock.picture,
                    purchaseUnit: livestock.purchaseUnit,
                });
            }
        }
        const mortality = yield mortalityModel_1.Mortality.create(req.body);
        const result = yield (0, query_1.queryData)(mortalityModel_1.Mortality, req);
        app_1.io.emit("mortality", { mortality });
        res.status(200).json({
            message: 'Mortality recorded successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createMortality = createMortality;
const getMortality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortality = yield mortalityModel_1.Mortality.findById(req.params.id);
        if (!mortality) {
            return res.status(404).json({ message: 'Mortality record not found' });
        }
        res.status(200).json({ data: mortality });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getMortality = getMortality;
const updateMortality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const mortality = yield mortalityModel_1.Mortality.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!mortality) {
            return res.status(404).json({ message: 'Mortality record not found' });
        }
        const result = yield (0, query_1.queryData)(mortalityModel_1.Mortality, req);
        res.status(200).json({
            message: 'Mortality record updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateMortality = updateMortality;
const getMortalities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(mortalityModel_1.Mortality, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getMortalities = getMortalities;
const searchMortalities = (req, res) => {
    return (0, query_1.search)(mortalityModel_1.Mortality, req, res);
};
exports.searchMortalities = searchMortalities;
