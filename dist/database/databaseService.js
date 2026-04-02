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
exports.DatabaseService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DatabaseService {
    static create(modelName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.create(data);
        });
    }
    static findByIdAndUpdate(modelName_1, id_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (modelName, id, data, options = { new: true }) {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findByIdAndUpdate(id, data, options);
        });
    }
    static findByIdAndDelete(modelName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findByIdAndDelete(id);
        });
    }
    static findOneAndDelete(modelName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findOneAndDelete(query);
        });
    }
    static findOneAndUpdate(modelName_1, query_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (modelName, query, data, options = { new: true }) {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findOneAndUpdate(query, data, options);
        });
    }
    static deleteMany(modelName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.deleteMany(query);
        });
    }
    static updateMany(modelName, query, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.updateMany(query, update);
        });
    }
    static findById(modelName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findById(id);
        });
    }
    static findOne(modelName_1) {
        return __awaiter(this, arguments, void 0, function* (modelName, query = {}) {
            const Model = mongoose_1.default.model(modelName);
            return yield Model.findOne(query);
        });
    }
}
exports.DatabaseService = DatabaseService;
