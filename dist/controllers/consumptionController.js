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
exports.searchConsumptions = exports.getConsumptions = exports.updateConsumption = exports.getConsumption = exports.createConsumption = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const consumptionModel_1 = require("../models/consumptionModel");
const productModel_1 = require("../models/productModel");
const app_1 = require("../app");
const createConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const feedId = req.body.feedId;
        const consumptionAmount = Number(req.body.consumption || 1);
        const pro = yield productModel_1.Product.findById(feedId);
        if (!pro) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // 1) Stock Check: Prevent negative stock
        const productName = req.body.feed || pro.name;
        if (!productName.toLowerCase().includes("water")) {
            if (pro.units < consumptionAmount) {
                return res.status(400).json({
                    message: `Insufficient stock for ${pro.name}. Current stock: ${pro.units}, Required: ${consumptionAmount}`
                });
            }
            yield productModel_1.Product.findByIdAndUpdate(feedId, {
                $inc: { units: -1 * consumptionAmount },
            });
        }
        // 2) Empty Bag Logic with Purchase Unit Sync
        if (pro.type === 'Feed') {
            const emptyBag = yield productModel_1.Product.findOne({ pId: pro._id });
            if (emptyBag) {
                yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                    $inc: { units: consumptionAmount },
                    picture: pro.picture,
                    purchaseUnit: pro.purchaseUnit, // Sync purchase unit
                });
            }
            else {
                yield productModel_1.Product.create({
                    name: `Empty Bag of ${pro.name}`,
                    pId: pro._id,
                    units: consumptionAmount,
                    unitPerPurchase: 1,
                    type: 'General',
                    isBuyable: true,
                    picture: pro.picture,
                    purchaseUnit: pro.purchaseUnit, // Copy purchase unit from source
                });
            }
        }
        req.body.amount = Number(pro.costPrice) * Number(req.body.consumption);
        req.body.unitPrice = Number(pro.costPrice);
        const consumption = yield consumptionModel_1.Consumption.create(req.body);
        const result = yield (0, query_1.queryData)(consumptionModel_1.Consumption, req);
        app_1.io.emit("consumption", { consumption });
        res.status(200).json({
            message: 'Consumption was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createConsumption = createConsumption;
const getConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consumption = yield consumptionModel_1.Consumption.findById(req.params.id);
        if (!consumption) {
            return res.status(404).json({ message: 'Consumption not found' });
        }
        res.status(200).json({ data: consumption });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getConsumption = getConsumption;
const updateConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const consumption = yield consumptionModel_1.Consumption.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!consumption) {
            return res.status(404).json({ message: 'Consumption not found' });
        }
        const result = yield (0, query_1.queryData)(consumptionModel_1.Consumption, req);
        res.status(200).json({
            message: 'The Consumption is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateConsumption = updateConsumption;
const getConsumptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(consumptionModel_1.Consumption, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getConsumptions = getConsumptions;
const searchConsumptions = (req, res) => {
    return (0, query_1.search)(consumptionModel_1.Consumption, req, res);
};
exports.searchConsumptions = searchConsumptions;
