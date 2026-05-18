import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/productModel';
import { Transaction } from '../models/transactionModel';
import { Consumption } from '../models/consumptionModel';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI_CLOUD || '';

async function reconcileEmptyBags() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find all feed products
  const feeds = await Product.find({ type: 'Feed' });
  console.log(`Found ${feeds.length} feed products`);

  for (const feed of feeds) {
    const feedId = feed._id.toString();
    const factor = feed.unitPerPurchase || 1;
    console.log(`\nReconciling empty bags for: ${feed.name} (ID: ${feedId}, unitPerPurchase: ${factor})`);

    // 1. Calculate Total Feed Consumed (in kg or base units)
    const consumptions = await Consumption.find({ feedId });
    const totalConsumedWeight = consumptions.reduce((sum, c) => sum + Number(c.consumption || 0), 0);
    const expectedEmptyBags = totalConsumedWeight / factor;
    console.log(`- Total Feed Consumed: ${totalConsumedWeight} (Expected Empty Bags: ${expectedEmptyBags})`);

    // 2. Find the corresponding Empty Bag product
    const emptyBag = await Product.findOne({ pId: feedId });
    if (!emptyBag) {
      console.log(`- No Empty Bag product found for this feed. Skipping.`);
      continue;
    }
    const emptyBagId = emptyBag._id.toString();

    // 3. Calculate Total Empty Bags Sold
    const transactions = await Transaction.find({
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
      await Product.findByIdAndUpdate(emptyBagId, { units: correctStock });
      console.log(`- UPDATE complete!`);
    } else {
      console.log(`- Empty bag stock is already correct!`);
    }
  }

  console.log('\nEmpty bags reconciliation complete');
  await mongoose.disconnect();
}

reconcileEmptyBags().catch(err => {
  console.error(err);
  process.exit(1);
});
