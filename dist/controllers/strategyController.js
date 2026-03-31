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
exports.searchStrategies = exports.deleteStrategy = exports.getStrategies = exports.updateStrategy = exports.getStrategy = exports.createStrategy = void 0;
const query_1 = require("../utils/query");
const errorHandler_1 = require("../utils/errorHandler");
const strategyModel_1 = require("../models/strategyModel");
const createStrategy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.strategies = JSON.parse(req.body.strategies);
        yield strategyModel_1.Strategy.create(req.body);
        const result = yield (0, query_1.queryData)(strategyModel_1.Strategy, req);
        res.status(200).json({
            message: 'Strategy was created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createStrategy = createStrategy;
const getStrategy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const strategy = yield strategyModel_1.Strategy.findById(req.params.id);
        if (!strategy) {
            return res.status(404).json({ message: 'Strategy not found' });
        }
        res.status(200).json({ data: strategy });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getStrategy = getStrategy;
const updateStrategy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const strategy = yield strategyModel_1.Strategy.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!strategy) {
            return res.status(404).json({ message: 'Strategy not found' });
        }
        const result = yield (0, query_1.queryData)(strategyModel_1.Strategy, req);
        res.status(200).json({
            message: 'The Strategy is updated successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateStrategy = updateStrategy;
const getStrategies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(strategyModel_1.Strategy, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getStrategies = getStrategies;
const deleteStrategy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield strategyModel_1.Strategy.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Strategy report not found' });
        }
        const result = yield (0, query_1.queryData)(strategyModel_1.Strategy, req);
        res.status(200).json(Object.assign({ message: 'Strategy report deleted successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteStrategy = deleteStrategy;
const searchStrategies = (req, res) => {
    return (0, query_1.search)(strategyModel_1.Strategy, req, res);
};
exports.searchStrategies = searchStrategies;
