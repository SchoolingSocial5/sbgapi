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
exports.searchOperations = exports.deleteOperation = exports.getOperations = exports.updateOperation = exports.getOperation = exports.createOperation = exports.getPerformanceSummary = void 0;
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const operationModel_1 = require("../models/operationModel");
const productModel_1 = require("../models/productModel");
const consumptionModel_1 = require("../models/consumptionModel");
const getPerformanceSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        const filter = { operation: 'Production' };
        if (dateFrom && dateTo) {
            filter.createdAt = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            };
        }
        const operations = yield operationModel_1.Operation.find(filter).lean();
        const consumptionFilter = {};
        if (dateFrom && dateTo) {
            consumptionFilter.createdAt = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            };
        }
        const consumptions = yield consumptionModel_1.Consumption.find(consumptionFilter).lean();
        // Group by Date (YYYY-MM-DD) and Pen
        const summaryMap = {};
        operations.forEach(op => {
            var _a;
            const date = new Date(op.createdAt).toISOString().split('T')[0];
            const key = `${date}_${op.pen}`;
            if (!summaryMap[key]) {
                summaryMap[key] = {
                    date,
                    pen: op.pen,
                    penId: op.penId,
                    staffNames: new Set([op.staffName]),
                    eggBreakdown: {}, // columnId -> units
                    totalManure: 0,
                    emptyBags: 0,
                    totalEggUnits: 0
                };
            }
            else {
                summaryMap[key].staffNames.add(op.staffName);
            }
            const target = summaryMap[key];
            // Handle Eggs
            if (op.productionData && op.productionData.length > 0) {
                op.productionData.forEach(data => {
                    const units = Number(data.units || 0);
                    target.eggBreakdown[data.columnId] = (target.eggBreakdown[data.columnId] || 0) + units;
                    target.totalEggUnits += units;
                });
            }
            // Handle Manure
            if ((_a = op.productName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('manure')) {
                target.totalManure += Number(op.quantity || 0);
            }
        });
        // Mix in Consumptions
        consumptions.forEach(c => {
            const date = new Date(c.createdAt).toISOString().split('T')[0];
            const key = `${date}_${c.pen}`;
            if (summaryMap[key]) {
                summaryMap[key].emptyBags += Number(c.consumption || 0);
            }
            else {
                // If there's consumption but no production recorded yet for that pen/day
                summaryMap[key] = {
                    date,
                    pen: c.pen,
                    staffNames: new Set([c.staffName]),
                    eggBreakdown: {},
                    totalManure: 0,
                    emptyBags: Number(c.consumption || 0),
                    totalEggUnits: 0
                };
            }
        });
        const result = Object.values(summaryMap).map((item) => (Object.assign(Object.assign({}, item), { staffName: Array.from(item.staffNames).join(', '), staffNames: undefined // clean up
         }))).sort((a, b) => b.date.localeCompare(a.date));
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getPerformanceSummary = getPerformanceSummary;
const createOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const data = Array.isArray(req.body) ? req.body : [req.body];
        for (const item of data) {
            // Automatically set type from product type if not provided
            if (item.productId && !item.type) {
                const pro = yield productModel_1.Product.findById(item.productId);
                if (pro)
                    item.type = pro.type;
            }
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
    var _a, _b;
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const oldOperation = yield operationModel_1.Operation.findById(req.params.id);
        if (!oldOperation) {
            return res.status(404).json({ message: 'Operation not found' });
        }
        // Sync inventory if production units changed
        if (oldOperation.productId && (req.body.productionData || req.body.quantity !== undefined)) {
            const oldProductionData = oldOperation.productionData || [];
            const oldTotalUnits = oldProductionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(oldOperation.quantity || 0);
            const newProductionData = req.body.productionData || oldOperation.productionData || [];
            const newTotalUnits = newProductionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(req.body.quantity !== undefined ? req.body.quantity : oldOperation.quantity || 0);
            const diff = newTotalUnits - oldTotalUnits;
            if (diff !== 0) {
                const pro = yield productModel_1.Product.findById(oldOperation.productId);
                if (pro) {
                    // Check if decreasing stock (diff < 0), ensure no negative result
                    if (diff < 0 && pro.units < Math.abs(diff)) {
                        return res.status(400).json({
                            message: `Insufficient stock to update operation for ${pro.name}. Available: ${pro.units}`
                        });
                    }
                    yield productModel_1.Product.findByIdAndUpdate(oldOperation.productId, {
                        $inc: { units: diff },
                    });
                    // Specialized Manure Bag Handling
                    if (((_a = oldOperation.productName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('manure')) && ((_b = oldOperation.unitName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('bag'))) {
                        const bagName = `${oldOperation.unitName} of ${oldOperation.productName}`;
                        const emptyBag = yield productModel_1.Product.findOne({ name: bagName });
                        if (emptyBag) {
                            const oldQty = Number(oldOperation.quantity || 0);
                            const newQty = Number(req.body.quantity !== undefined ? req.body.quantity : oldOperation.quantity || 0);
                            const qtyDiff = newQty - oldQty;
                            if (qtyDiff !== 0) {
                                yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                                    $inc: { units: qtyDiff },
                                });
                            }
                        }
                    }
                }
            }
        }
        const operation = yield operationModel_1.Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!operation) {
            return res.status(404).json({ message: 'Operation not found' });
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
const deleteOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const item = yield operationModel_1.Operation.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Operation not found' });
        }
        // If it's a production record, reverse the stock update
        if (item.productId) {
            const productionData = item.productionData || [];
            const totalUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(item.quantity || 0);
            if (totalUnits > 0) {
                // Decrement product stock
                yield productModel_1.Product.findByIdAndUpdate(item.productId, {
                    $inc: { units: -totalUnits },
                });
                // Specialized Manure Bag Handling
                if (((_a = item.productName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('manure')) && ((_b = item.unitName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('bag'))) {
                    const bagName = `${item.unitName} of ${item.productName}`;
                    const emptyBag = yield productModel_1.Product.findOne({ name: bagName });
                    if (emptyBag) {
                        yield productModel_1.Product.findByIdAndUpdate(emptyBag._id, {
                            $inc: { units: -Number(item.quantity) },
                        });
                    }
                }
            }
        }
        yield operationModel_1.Operation.findByIdAndDelete(req.params.id);
        const result = yield (0, query_1.queryData)(operationModel_1.Operation, req);
        res.status(200).json({
            message: 'The operation is deleted successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteOperation = deleteOperation;
const searchOperations = (req, res) => {
    return (0, query_1.search)(operationModel_1.Operation, req, res);
};
exports.searchOperations = searchOperations;
