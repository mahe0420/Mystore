import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Product schema (minimal, just for seeding)
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  rating: {
    rate: Number,
    count: Number,
  },
});

const Product = mongoose.model("Product", productSchema);

const seedProducts = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ Connected to MongoDB Atlas");

    // 2. Fetch products from FakeStore API
    const { data } = await axios.get("https://fakestoreapi.com/products");
    console.log(`📦 Fetched ${data.length} products from FakeStore API`);

    // 3. Clear old products
    await Product.deleteMany({});
    console.log("🗑️ Cleared old products");

    // 4. Insert new products
    await Product.insertMany(data);
    console.log("🎉 Inserted products into MongoDB successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error.message);
    process.exit(1);
  }
};

seedProducts();
