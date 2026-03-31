"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const productController_1 = require("../controllers/productController");
const router = express_1.default.Router();
router.route('/search').get(productController_1.searchProducts);
router
    .route('/stocking')
    .get(productController_1.getProductStocks)
    .post(upload.any(), productController_1.postProductStock);
router
    .route('/stocking/:id')
    .delete(productController_1.deleteProductStocking)
    .patch(upload.any(), productController_1.updateProductStock);
router
    .route('/:id')
    .get(productController_1.getAProduct)
    .patch(upload.any(), productController_1.updateProduct)
    .delete(productController_1.deleteProduct);
router.route('/').get(productController_1.getProducts).post(upload.any(), productController_1.createProduct);
exports.default = router;
