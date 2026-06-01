const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const transaction = await db.collection('transactions').findOne({ 'cartProducts.name': 'Fresh Eggs' });
  console.log("Cart Item _id:", transaction.cartProducts[0]._id, typeof transaction.cartProducts[0]._id);
  
  process.exit(0);
}
run();
