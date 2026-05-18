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
const consumptionModel_1 = require("../models/consumptionModel");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI_CLOUD || '';
function reconcileEmptyBags() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!MONGO_URI) {
            console.error('MONGO_URI is not defined');
            process.exit(1);
        }
        yield mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        // Find all feed products
        const feeds = yield productModel_1.Product.find({ type: 'Feed' });
        console.log(`Found ${feeds.length} feed products`);
        for (const feed of feeds) {
            const feedId = feed._id.toString();
            const factor = feed.unitPerPurchase || 1;
            console.log(`\nReconciling empty bags for: ${feed.name} (ID: ${feedId}, unitPerPurchase: ${factor})`);
            // 1. Calculate Total Feed Consumed (in kg or base units)
            const consumptions = yield consumptionModel_1.Consumption.find({ feedId });
            const totalConsumedWeight = consumptions.reduce((sum, c) => sum + Number(c.consumption || 0), 0);
            const expectedEmptyBags = totalConsumedWeight / factor;
            console.log(`- Total Feed Consumed: ${totalConsumedWeight} (Expected Empty Bags: ${expectedEmptyBags})`);
            // 2. Find the corresponding Empty Bag product
            const emptyBag = yield productModel_1.Product.findOne({ pId: feedId });
            if (!emptyBag) {
                console.log(`- No Empty Bag product found for this feed. Skipping.`);
                continue;
            }
            const emptyBagId = emptyBag._id.toString();
            // 3. Calculate Total Empty Bags Sold
            const transactions = yield transactionModel_1.Transaction.find({
                isProfit: true,
                $or: [
                    { 'cartProducts._id': emptyBagId },
                    { 'product._id': emptyBagId }
                ]
            });
            let totalSoldBags = 0;
            transactions.forEach(t => {
                // Check cartProducts
                if (t.cartProducts && Array.isArray(t.cartProducts)) {
                    t.cartProducts.forEach(p => {
                        if (p._id.toString() === emptyBagId) {
                            totalSoldBags += Number(p.cartUnits || 0);
                        }
                    });
                }
                // Check legacy 'product' field
                if (t.product && t.product._id && t.product._id.toString() === emptyBagId) {
                    totalSoldBags += Number(t.product.cartUnits || 0);
                }
            });
            console.log(`- Total Empty Bags Sold: ${totalSoldBags}`);
            // 4. Compute Correct Stock
            let correctStock = expectedEmptyBags - totalSoldBags;
            if (correctStock < 0) {
                console.warn(`- WARNING: Calculated stock is negative (${correctStock}). Setting to 0.`);
                correctStock = 0;
            }
            // Round to 2 decimal places for cleaner stock view
            correctStock = Math.round(correctStock * 100) / 100;
            console.log(`- Current Registered Stock: ${emptyBag.units}`);
            console.log(`- Correct stock should be: ${correctStock}`);
            if (emptyBag.units !== correctStock) {
                console.log(`- UPDATING empty bag product "${emptyBag.name}" units to ${correctStock}...`);
                yield productModel_1.Product.findByIdAndUpdate(emptyBagId, { units: correctStock });
                console.log(`- UPDATE complete!`);
            }
            else {
                console.log(`- Empty bag stock is already correct!`);
            }
        }
        console.log('\nEmpty bags reconciliation complete');
        yield mongoose_1.default.disconnect();
    });
}
reconcileEmptyBags().catch(err => {
    console.error(err);
    process.exit(1);
});
