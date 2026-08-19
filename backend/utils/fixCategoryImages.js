import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/Category.js";

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bags_ecommerce_db";

const updates = [
  { name: "Tote Bags",      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600" },
  { name: "Shoulder Bags",  image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600" },
  { name: "Crossbody Bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600" },
  { name: "Clutch Bags",    image: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?q=80&w=600" },
  { name: "Backpacks",      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600" },
  { name: "Satchel Bags",   image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=600" },
  { name: "Bucket Bags",    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600" },
  { name: "Wallets",        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600" },
];

(async () => {
  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB");
  for (const u of updates) {
    await Category.updateOne({ name: u.name }, { image: u.image });
    console.log("Updated:", u.name);
  }
  await mongoose.disconnect();
  console.log("All category images updated!");
})();
