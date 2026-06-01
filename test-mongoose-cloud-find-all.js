const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({ name: 'Fresh Eggs' }).toArray();
  console.log("All Fresh Eggs products:", products.length);
  products.forEach(p => console.log(p._id, p.units, p.isBuyable, p.isSelling, p.type));

  process.exit(0);
}
run();
