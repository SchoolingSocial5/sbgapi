const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb://127.0.0.1:27017/test-mongoose-bulk";
mongoose.connect(uri);

const ProductSchema = new Schema({
  name: String,
  units: Number,
});
const Product = mongoose.model('Product', ProductSchema);

async function run() {
  await Product.deleteMany({});
  const p = await Product.create({ name: 'Fresh Eggs', units: 12480 });

  const bulkOps = [{
    updateOne: {
      filter: { _id: p._id.toString(), units: { $gte: 10 * 30 } },
      update: { $inc: { units: -300 } }
    }
  }];

  const bulkResult = await Product.bulkWrite(bulkOps);
  console.log("Bulk Result modifiedCount:", bulkResult.modifiedCount);

  const updatedP = await Product.findById(p._id);
  console.log("Updated units:", updatedP.units);
  process.exit(0);
}
run();
