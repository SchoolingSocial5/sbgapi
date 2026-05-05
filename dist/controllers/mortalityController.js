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
const operationModel_1 = require("../models/operationModel");
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
        // Stock Check & Pen validation for Livestock (Bypass if it's an Egg product)
        const isEggProduct = livestock.name.toLowerCase().includes('egg');
        if (livestock.type === 'Livestock' && !isEggProduct) {
            const staffPen = req.body.pen;
            if (!staffPen || staffPen === "No Pen Assigned") {
                return res.status(400).json({
                    message: 'You are not assigned to any Pen House. Operation aborted.'
                });
            }
            // Check if this pen is in the distribution list
            const distributions = livestock.penDistributions || [];
            const penEntry = distributions.find(d => d.penName === staffPen);
            if (!penEntry) {
                return res.status(400).json({
                    message: `The assigned pen (${staffPen}) does not have this livestock distributed to it.`
                });
            }
            const updateResult = yield productModel_1.Product.updateOne({
                _id: productId,
                units: { $gte: quantity },
                "penDistributions": { $elemMatch: { penName: staffPen, units: { $gte: quantity } } }
            }, { $inc: { units: -1 * quantity, "penDistributions.$[elem].units": -1 * quantity } }, { arrayFilters: [{ "elem.penName": staffPen }] });
            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({
                    message: `Insufficient stock in ${staffPen} for mortality record. Pen stock: ${penEntry.units}, Mortality: ${quantity}`
                });
            }
        }
        else {
            // General item stock decrement
            const updateResult = yield productModel_1.Product.updateOne({ _id: productId, units: { $gte: quantity } }, { $inc: { units: -1 * quantity } });
            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({
                    message: `Insufficient stock. Current stock: ${livestock.units}, Mortality: ${quantity}`
                });
            }
        }
        // Cracks Product Logic: if the product name includes 'egg', track cracked eggs
        if (livestock.name.toLowerCase().includes('egg')) {
            const crackProduct = yield productModel_1.Product.findOne({ pId: livestock._id, name: 'Cracks' });
            let finalProductId = "";
            if (crackProduct) {
                finalProductId = crackProduct._id;
                yield productModel_1.Product.findByIdAndUpdate(crackProduct._id, {
                    $inc: { units: quantity },
                    picture: livestock.picture,
                    purchaseUnit: livestock.purchaseUnit,
                    unitPerPurchase: livestock.unitPerPurchase,
                });
            }
            else {
                const newCrack = yield productModel_1.Product.create({
                    name: `Cracks`,
                    pId: livestock._id,
                    units: quantity,
                    unitPerPurchase: livestock.unitPerPurchase || 1,
                    type: 'General',
                    isBuyable: true,
                    picture: livestock.picture,
                    purchaseUnit: livestock.purchaseUnit,
                });
                finalProductId = newCrack._id;
            }
            // Automatically create a Production record for Cracks
            yield operationModel_1.Operation.create({
                operation: 'Production',
                productName: 'Cracks',
                productId: finalProductId,
                quantity: quantity,
                staffName: req.body.staffName,
                pen: req.body.pen,
                remark: `Automated production from ${livestock.name} damage recording`
            });
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
    var _a;
    try {
        const oldMortality = yield mortalityModel_1.Mortality.findById(req.params.id);
        if (!oldMortality) {
            return res.status(404).json({ message: 'Mortality record not found' });
        }
        // Sync inventory if birds count changed
        if (req.body.birds !== undefined) {
            const productId = oldMortality.productId;
            const oldQuantity = Number(oldMortality.birds || 0);
            const newQuantity = Number(req.body.birds || 0);
            const diff = oldQuantity - newQuantity;
            if (diff !== 0) {
                const livestock = yield productModel_1.Product.findById(productId);
                if (livestock) {
                    const isEggProduct = livestock.name.toLowerCase().includes('egg');
                    const staffPen = oldMortality.pen;
                    if (livestock.type === 'Livestock' && !isEggProduct && staffPen) {
                        // Decrementing (diff < 0), check stock
                        if (diff < 0) {
                            const penEntry = (_a = livestock.penDistributions) === null || _a === void 0 ? void 0 : _a.find(d => d.penName === staffPen);
                            if (!penEntry || penEntry.units < Math.abs(diff)) {
                                return res.status(400).json({ message: `Insufficient stock in ${staffPen}` });
                            }
                        }
                        yield productModel_1.Product.updateOne(Object.assign({ _id: productId }, (diff < 0 ? { units: { $gte: Math.abs(diff) }, "penDistributions": { $elemMatch: { penName: staffPen, units: { $gte: Math.abs(diff) } } } } : {})), { $inc: { units: diff, "penDistributions.$[elem].units": diff } }, { arrayFilters: [{ "elem.penName": staffPen }] });
                    }
                    else {
                        // General decrement
                        if (diff < 0 && livestock.units < Math.abs(diff)) {
                            return res.status(400).json({ message: 'Insufficient stock' });
                        }
                        yield productModel_1.Product.updateOne(Object.assign({ _id: productId }, (diff < 0 ? { units: { $gte: Math.abs(diff) } } : {})), { $inc: { units: diff } });
                    }
                }
            }
        }
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
