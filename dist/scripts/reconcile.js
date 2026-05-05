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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const productModel_1 = require("../models/productModel");
const transactionModel_1 = require("../models/transactionModel");
const operationModel_1 = require("../models/operationModel");
const consumptionModel_1 = require("../models/consumptionModel");
const mortalityModel_1 = require("../models/mortalityModel");
const productModel_2 = require("../models/productModel");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI_CLOUD || '';
function reconcile() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!MONGO_URI) {
            console.error('MONGO_URI is not defined');
            process.exit(1);
        }
        yield mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const products = yield productModel_1.Product.find();
        console.log(`Found ${products.length} products`);
        for (const product of products) {
            const productId = product._id.toString();
            console.log(`Reconciling ${product.name} (${productId})...`);
            let totalUnits = 0;
            // 1. Stocking (Manual adjustments)
            const stockings = yield productModel_2.Stocking.find({ productId });
            stockings.forEach(s => {
                const amount = Number(s.units || 0);
                if (s.isProfit) {
                    totalUnits += amount;
                }
                else {
                    totalUnits -= amount;
                }
            });
            // 2. Production (Operations)
            const productions = yield operationModel_1.Operation.find({ productId, operation: 'Production' });
            productions.forEach(op => {
                const productionData = op.productionData || [];
                const opUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(op.quantity || 0);
                totalUnits += opUnits;
            });
            // 3. Consumption
            const consumptions = yield consumptionModel_1.Consumption.find({ feedId: productId });
            consumptions.forEach(c => {
                totalUnits -= Number(c.consumption || 0);
            });
            // 4. Mortality
            const mortalities = yield mortalityModel_1.Mortality.find({ productId });
            mortalities.forEach(m => {
                totalUnits -= Number(m.birds || 0);
            });
            // 5. Transactions (Sales and Purchases)
            // We need to find transactions where this product is in cartProducts
            // Or if it's a legacy transaction where 'product' field was used
            const transactions = yield transactionModel_1.Transaction.find({
                $or: [
                    { 'cartProducts._id': productId },
                    { 'product._id': productId }
                ]
            });
            transactions.forEach(t => {
                const isProfit = t.isProfit; // true = Sale (Stock -), false = Purchase (Stock +)
                // Check cartProducts
                if (t.cartProducts && Array.isArray(t.cartProducts)) {
                    t.cartProducts.forEach(p => {
                        if (p._id.toString() === productId) {
                            const units = Number(p.cartUnits || 0) * (p.unitPerPurchase || 1);
                            if (isProfit) {
                                totalUnits -= units;
                            }
                            else {
                                totalUnits += units;
                            }
                        }
                    });
                }
                // Check legacy 'product' field
                if (t.product && t.product._id && t.product._id.toString() === productId) {
                    const units = Number(t.product.cartUnits || 0) * (t.product.unitPerPurchase || 1);
                    if (isProfit) {
                        totalUnits -= units;
                    }
                    else {
                        totalUnits += units;
                    }
                }
            });
            console.log(`Calculated units for ${product.name}: ${totalUnits} (Current: ${product.units})`);
            if (totalUnits !== product.units) {
                console.log(`Updating ${product.name} units to ${totalUnits}`);
                // Use findByIdAndUpdate to bypass validation if needed, or just product.units = totalUnits; await product.save();
                // Since we added min: 0, we should be careful if totalUnits < 0.
                if (totalUnits < 0) {
                    console.warn(`WARNING: Calculated units for ${product.name} is negative (${totalUnits}). Setting to 0.`);
                    totalUnits = 0;
                }
                yield productModel_1.Product.findByIdAndUpdate(productId, { units: totalUnits });
            }
        }
        console.log('Reconciliation complete');
        yield mongoose_1.default.disconnect();
    });
}
reconcile().catch(err => {
    console.error(err);
    process.exit(1);
});
