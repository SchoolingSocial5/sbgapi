const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const product = await db.collection('products').findOne({ name: 'Fresh Eggs' });
  console.log("Fresh Eggs product:", product);

  process.exit(0);
}
run();
