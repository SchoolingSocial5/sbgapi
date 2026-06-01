const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const transactions = await db.collection('transactions').find({ 'cartProducts.name': 'Fresh Eggs' }).sort({ createdAt: -1 }).limit(5).toArray();
  console.log(`Found ${transactions.length} recent transactions for Fresh Eggs.`);
  transactions.forEach(t => {
    console.log(`Transaction ID: ${t._id}, Date: ${t.createdAt}`);
    t.cartProducts.forEach(cp => {
      if (cp.name === 'Fresh Eggs') {
        console.log(`  Cart Item: ${cp.name}, cartUnits: ${cp.cartUnits}, unitPerPurchase: ${cp.unitPerPurchase}, type: ${typeof cp.cartUnits}`);
      }
    });
  });

  process.exit(0);
}
run();
