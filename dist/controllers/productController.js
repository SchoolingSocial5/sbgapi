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
exports.getProductStocks = exports.deleteProductStocking = exports.updateProductStock = exports.postProductStock = exports.searchProducts = exports.deleteProduct = exports.getProducts = exports.updateProduct = exports.getAProduct = exports.createProduct = void 0;
const productModel_1 = require("../models/productModel");
const query_1 = require("../utils/query");
const fileUpload_1 = require("../utils/fileUpload");
const errorHandler_1 = require("../utils/errorHandler");
const app_1 = require("../app");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        yield productModel_1.Product.create(req.body);
        const result = yield (0, query_1.queryData)(productModel_1.Product, req);
        res.status(200).json(Object.assign({ message: 'Product is created successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.createProduct = createProduct;
const getAProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }
        res.status(200).json({ data: product });
    }
    catch (error) {
        console.log(error);
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getAProduct = getAProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFiles = yield (0, fileUpload_1.uploadFilesToS3)(req);
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url;
        });
        const product = yield productModel_1.Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }
        const result = yield (0, query_1.queryData)(productModel_1.Product, req);
        res.status(200).json(Object.assign({ message: 'The product is updated successfully' }, result));
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateProduct = updateProduct;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(productModel_1.Product, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getProducts = getProducts;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield productModel_1.Product.findByIdAndDelete(req.params.id);
        yield productModel_1.Stocking.findOneAndDelete({ productId: req.params.id });
        const result = yield (0, query_1.queryData)(productModel_1.Product, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteProduct = deleteProduct;
const searchProducts = (req, res) => {
    return (0, query_1.search)(productModel_1.Product, req, res);
};
exports.searchProducts = searchProducts;
// export const postProductStock = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const isProfit = req.body.isProfit === true || req.body.isProfit === 'true'
//     const units = Number(req.body.units)
//     if (isNaN(units)) {
//       res.status(400).json({ message: 'Invalid units value' })
//     }
//     await Product.findByIdAndUpdate(req.body.productId, {
//       $inc: { units: isProfit ? units : -units },
//     })
//     const stocking = await Stocking.create(req.body)
//     const result = await queryData<IStocking>(Stocking, req)
//     io.emit("stocking", { stocking, production: stocking })
//     if (!isProfit) {
//       io.emit("motality", { stocking })
//     }
//     res.status(200).json({
//       message: 'Product stock record has been created successfully',
//       result,
//     })
//   } catch (error: any) {
//     handleError(res, undefined, undefined, error)
//   }
// }
const postProductStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isProfit = req.body.isProfit === true || req.body.isProfit === 'true';
        const units = Number(req.body.units);
        if (isNaN(units) || units <= 0) {
            res.status(400).json({ message: 'Invalid units value' });
            return;
        }
        const product = yield productModel_1.Product.findById(req.body.productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // ✅ Prevent stock going below 0
        if (!isProfit && product.units < units) {
            res.status(400).json({
                message: 'Insufficient stock available',
            });
            return;
        }
        // ✅ Update safely
        yield productModel_1.Product.findByIdAndUpdate(req.body.productId, {
            $inc: { units: isProfit ? units : -units },
        });
        if (req.body.parentProductId) {
            const stock = yield productModel_1.Product.findById(req.body.parentProductId);
            const percent = req.body.units / (stock.units);
            yield productModel_1.Product.findByIdAndUpdate(req.body.parentProductId, { percentageProduction: percent });
            req.body.percentageProduction = percent;
        }
        const stocking = yield productModel_1.Stocking.create(req.body);
        const result = yield (0, query_1.queryData)(productModel_1.Stocking, req);
        app_1.io.emit('stocking', { stocking, production: stocking });
        if (!isProfit) {
            app_1.io.emit('motality', { stocking });
        }
        res.status(200).json({
            message: 'Product stock record has been created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.postProductStock = postProductStock;
const updateProductStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isProfit = req.body.isProfit === true || req.body.isProfit === 'true';
        const units = Number(req.body.units);
        if (isNaN(units)) {
            res.status(400).json({ message: 'Invalid units value' });
        }
        yield productModel_1.Product.findByIdAndUpdate(req.body.productId, {
            $inc: { units: isProfit ? units : -units },
        });
        yield productModel_1.Stocking.create(req.body);
        const result = yield (0, query_1.queryData)(productModel_1.Stocking, req);
        res.status(200).json({
            message: 'Product stock record has been created successfully',
            result,
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.updateProductStock = updateProductStock;
const deleteProductStocking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stock = yield productModel_1.Stocking.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'stock not found' });
        }
        yield productModel_1.Product.findByIdAndUpdate(req.body.productId, {
            $inc: { units: stock.isProfit ? -stock.units : stock.units },
        });
        const result = yield (0, query_1.queryData)(productModel_1.Stocking, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.deleteProductStocking = deleteProductStocking;
const getProductStocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, query_1.queryData)(productModel_1.Stocking, req);
        res.status(200).json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, undefined, undefined, error);
    }
});
exports.getProductStocks = getProductStocks;
