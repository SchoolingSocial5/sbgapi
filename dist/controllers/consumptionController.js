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
exports.searchConsumptions = exports.getConsumptions = exports.updateConsumption = exports.getConsumption = exports.deleteConsumption = exports.createConsumption = void 0;
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
        const data = Array.isArray(req.body) ? req.body : [req.body];
        for (const item of data) {
            const feedId = item.feedId;
            const consumptionAmount = Number(item.consumption || 0);
            const pro = yield productModel_1.Product.findById(feedId);
            if (!pro) {
                // Skip or handle error? For bulk, skip and continue or fail all? 
                // Following operationController pattern: we assume validation happened on frontend.
                continue;
            }
            // 1) Stock Check: Prevent negative stock
            const productName = item.feed || pro.name;
            if (!productName.toLowerCase().includes("water")) {
                const updateResult = yield productModel_1.Product.updateOne({ _id: feedId, units: { $gte: consumptionAmount } }, { $inc: { units: -1 * consumptionAmount } });
                if (updateResult.modifiedCount === 0) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${pro.name}. Current stock: ${pro.units}, Required: ${consumptionAmount}`
                    });
                }
            }
            // 2) Empty Bag Logic with Purchase Unit Sync
            if (pro.type === 'Feed') {
                const bagUnits = consumptionAmount / (pro.unitPerPurchase || 1);
                const emptyBag = yield productModel_1.Product.findOne({ pId: pro._id });
                if (emptyBag) {
                    yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                        $inc: { units: bagUnits },
                        picture: pro.picture,
                        purchaseUnit: pro.purchaseUnit,
                    });
                }
                else {
                    yield productModel_1.Product.create({
                        name: `Empty Bag of ${pro.name}`,
                        pId: pro._id,
                        units: bagUnits,
                        unitPerPurchase: 1,
                        type: 'General',
                        isBuyable: true,
                        picture: pro.picture,
                        purchaseUnit: pro.purchaseUnit,
                    });
                }
            }
            if (!item._id)
                delete item._id;
            item.amount = Number(pro.costPrice) * Number(item.consumption);
            item.unitPrice = Number(pro.costPrice);
            if (!item.type)
                item.type = pro.type;
            const newConsumption = yield consumptionModel_1.Consumption.create(item);
            app_1.io.emit("consumption", { consumption: newConsumption });
        }
        const result = yield (0, query_1.queryData)(consumptionModel_1.Consumption, req);
        res.status(200).json({
            message: data.length > 1 ? `${data.length} consumptions were created successfully` : 'Consumption was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createConsumption = createConsumption;
const deleteConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield consumptionModel_1.Consumption.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Consumption not found' });
        }
        const feedId = item.feedId;
        const consumptionAmount = Number(item.consumption || 0);
        const pro = yield productModel_1.Product.findById(feedId);
        if (pro) {
            const productName = item.feed || pro.name;
            if (!productName.toLowerCase().includes("water")) {
                // Reverse stock deduction
                yield productModel_1.Product.findByIdAndUpdate(feedId, {
                    $inc: { units: consumptionAmount },
                });
            }
            // Reverse Empty Bag Logic
            if (pro.type === 'Feed') {
                const emptyBag = yield productModel_1.Product.findOne({ pId: pro._id });
                if (emptyBag) {
                    const bagUnits = consumptionAmount / (pro.unitPerPurchase || 1);
                    yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                        $inc: { units: -1 * bagUnits },
                    });
                }
            }
        }
        yield consumptionModel_1.Consumption.findByIdAndDelete(req.params.id);
        const result = yield (0, query_1.queryData)(consumptionModel_1.Consumption, req);
        res.status(200).json({
            message: 'The consumption is deleted successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteConsumption = deleteConsumption;
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
        const oldConsumption = yield consumptionModel_1.Consumption.findById(req.params.id);
        if (!oldConsumption) {
            return res.status(404).json({ message: 'Consumption not found' });
        }
        // Sync inventory if consumption amount changed
        if (req.body.consumption !== undefined) {
            const feedId = oldConsumption.feedId;
            const oldAmount = Number(oldConsumption.consumption || 0);
            const newAmount = Number(req.body.consumption || 0);
            const diff = oldAmount - newAmount;
            if (diff !== 0) {
                const pro = yield productModel_1.Product.findById(feedId);
                if (pro) {
                    const productName = oldConsumption.feed || pro.name;
                    if (!productName.toLowerCase().includes("water")) {
                        // If decreasing stock (new > old, diff < 0), check availability
                        if (diff < 0) {
                            const amountToDeduct = Math.abs(diff);
                            if (pro.units < amountToDeduct) {
                                return res.status(400).json({
                                    message: `Insufficient stock for ${pro.name}. Available: ${pro.units}`
                                });
                            }
                        }
                        yield productModel_1.Product.updateOne(Object.assign({ _id: feedId }, (diff < 0 ? { units: { $gte: Math.abs(diff) } } : {})), { $inc: { units: diff } });
                    }
                    // Sync Empty Bag
                    if (pro.type === 'Feed') {
                        const emptyBag = yield productModel_1.Product.findOne({ pId: pro._id });
                        if (emptyBag) {
                            const diffInBags = diff / (pro.unitPerPurchase || 1);
                            yield productModel_1.Product.updateOne(Object.assign({ _id: emptyBag._id }, (diffInBags > 0 ? { units: { $gte: diffInBags } } : {})), { $inc: { units: -diffInBags } });
                        }
                    }
                }
            }
        }
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
