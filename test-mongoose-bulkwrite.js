const mongoose = require('mongoose');

const uri = "mongodb+srv://schoolingsocial5_db_user:G4tWSx9jVRXF50mt@schooling.zofwimm.mongodb.net/Sbg?retryWrites=true&w=majority";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String },
    units: { type: Number, min: 0 },
    unitPerPurchase: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const Product = mongoose.model('Product', ProductSchema);

async function run() {
  await mongoose.connect(uri);

  const cartItem = {
    _id: "69cebef517faaa728691d68f", // string!
    cartUnits: 1,
    unitPerPurchase: 30
  };

  const bulkOps = [{
    updateOne: {
      filter: { 
        _id: cartItem._id, 
        units: { $gte: cartItem.cartUnits * (cartItem.unitPerPurchase || 1) } 
      },
      update: {
        $inc: { units: -cartItem.cartUnits * (cartItem.unitPerPurchase || 1) },
      },
    }
  }];

  const bulkResult = await Product.bulkWrite(bulkOps);
  console.log("Bulk Result modifiedCount:", bulkResult.modifiedCount);
  console.log("Bulk Result matchedCount:", bulkResult.matchedCount);

  // Restore if modified
  if (bulkResult.modifiedCount > 0) {
    await Product.findByIdAndUpdate(cartItem._id, { $inc: { units: 30 } });
  }

  process.exit(0);
}
run();
