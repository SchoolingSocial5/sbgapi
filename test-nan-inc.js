const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

const ProductSchema = new mongoose.Schema({ units: Number });
const Product = mongoose.model('TestProduct', ProductSchema);

async function run() {
  await mongoose.connect(uri);

  const p = await Product.create({ units: 100 });

  const bulkOps = [{
    updateOne: {
      filter: { _id: p._id },
      update: { $inc: { units: NaN } }
    }
  }];

  try {
    const res = await Product.bulkWrite(bulkOps);
    console.log("Modified:", res.modifiedCount);
  } catch(e) {
    console.log("Error:", e.message);
  }

  process.exit(0);
}
run();
