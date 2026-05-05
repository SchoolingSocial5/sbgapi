import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/productModel';
import { Transaction } from '../models/transactionModel';
import { Operation } from '../models/operationModel';
import { Consumption } from '../models/consumptionModel';
import { Mortality } from '../models/mortalityModel';
import { Stocking } from '../models/productModel';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI_CLOUD || '';

async function reconcile() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find();
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    const productId = product._id.toString();
    console.log(`Reconciling ${product.name} (${productId})...`);

    let totalUnits = 0;

    // 1. Stocking (Manual adjustments)
    const stockings = await Stocking.find({ productId });
    stockings.forEach(s => {
      const amount = Number(s.units || 0);
      if (s.isProfit) {
        totalUnits += amount;
      } else {
        totalUnits -= amount;
      }
    });

    // 2. Production (Operations)
    const productions = await Operation.find({ productId, operation: 'Production' });
    productions.forEach(op => {
      const productionData = op.productionData || [];
      const opUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(op.quantity || 0);
      totalUnits += opUnits;
    });

    // 3. Consumption
    const consumptions = await Consumption.find({ feedId: productId });
    consumptions.forEach(c => {
      totalUnits -= Number(c.consumption || 0);
    });

    // 4. Mortality
    const mortalities = await Mortality.find({ productId });
    mortalities.forEach(m => {
      totalUnits -= Number(m.birds || 0);
    });

    // 5. Transactions (Sales and Purchases)
    // We need to find transactions where this product is in cartProducts
    // Or if it's a legacy transaction where 'product' field was used
    const transactions = await Transaction.find({
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
            } else {
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
        } else {
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
      await Product.findByIdAndUpdate(productId, { units: totalUnits });
    }
  }

  console.log('Reconciliation complete');
  await mongoose.disconnect();
}

reconcile().catch(err => {
  console.error(err);
  process.exit(1);
});
