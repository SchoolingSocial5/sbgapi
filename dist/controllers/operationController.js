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
exports.searchOperations = exports.getOperations = exports.updateOperation = exports.getOperation = exports.createOperation = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const operationModel_1 = require("../models/operationModel");
const productModel_1 = require("../models/productModel");
const createOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const data = Array.isArray(req.body) ? req.body : [req.body];
        for (const item of data) {
            yield operationModel_1.Operation.create(item);
            // If a product is linked, sum production units and add to stock
            if (item.productId) {
                const productionData = item.productionData || [];
                const totalUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(item.quantity || 0);
                if (totalUnits > 0) {
                    const pro = yield productModel_1.Product.findById(item.productId);
                    if (pro) {
                        // 1) Update base product stock
                        yield productModel_1.Product.findByIdAndUpdate(item.productId, {
                            $inc: { units: totalUnits },
                        });
                        // 2) Specialized Manure Bag Handling
                        if (((_a = item.productName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('manure')) && ((_b = item.unitName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('bag'))) {
                            const bagName = `${item.unitName} of ${item.productName}`;
                            const emptyBag = yield productModel_1.Product.findOne({ name: bagName });
                            if (emptyBag) {
                                yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                                    $inc: { units: Number(item.quantity) },
                                    picture: pro.picture,
                                    costPrice: pro.costPrice,
                                    price: pro.price,
                                });
                            }
                            else {
                                yield productModel_1.Product.create({
                                    name: bagName,
                                    pId: pro._id,
                                    units: Number(item.quantity),
                                    unitPerPurchase: 1,
                                    type: 'General',
                                    isBuyable: true,
                                    isProducing: false,
                                    picture: pro.picture,
                                    purchaseUnit: item.unitName,
                                    costPrice: pro.costPrice,
                                    price: pro.price,
                                });
                            }
                        }
                    }
                }
            }
        }
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json({
            message: data.length > 1 ? `${data.length} operations were created successfully` : 'Operation was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createOperation = createOperation;
const getOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operation = yield operationModel_1.Operation.findById(req.params.id);
        if (!operation) {
            return res.status(404).json({ message: 'operation not found' });
        }
        res.status(200).json({ data: operation });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getOperation = getOperation;
const updateOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const service = yield operationModel_1.Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({ message: 'service not found' });
        }
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json({
            message: 'The operation is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateOperation = updateOperation;
const getOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getOperations = getOperations;
const searchOperations = (req, res) => {
    return (0, query_1.search)(operationModel_1.Operation, req, res);
};
exports.searchOperations = searchOperations;
