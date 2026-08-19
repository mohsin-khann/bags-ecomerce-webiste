import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Banner from "../models/Banner.js";
import Testimonial from "../models/Testimonial.js";
import Brand from "../models/Brand.js";

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bags_ecommerce_db";

const categories = [
  { name: "Tote Bags", slug: "tote-bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600", isActive: true, sortOrder: 1 },
  { name: "Shoulder Bags", slug: "shoulder-bags", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?q=80&w=600", isActive: true, sortOrder: 2 },
  { name: "Crossbody Bags", slug: "crossbody-bags", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?q=80&w=600", isActive: true, sortOrder: 3 },
  { name: "Clutch Bags", slug: "clutch-bags", image: "https://images.unsplash.com/photo-1622560480654-d92214f1880e?q=80&w=600", isActive: true, sortOrder: 4 },
  { name: "Backpacks", slug: "backpacks", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600", isActive: true, sortOrder: 5 },
  { name: "Satchel Bags", slug: "satchel-bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600", isActive: true, sortOrder: 6 },
  { name: "Bucket Bags", slug: "bucket-bags", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=600", isActive: true, sortOrder: 7 },
  { name: "Wallets", slug: "wallets", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600", isActive: true, sortOrder: 8 },
];

const brands = [
  { name: "Maison Sac", slug: "maison-sac", isActive: true },
  { name: "LuxeCarry", slug: "luxecarry", isActive: true },
  { name: "UrbanEdge", slug: "urbanedge", isActive: true },
  { name: "ClassicHold", slug: "classichold", isActive: true },
];

const products = [
  {
    name: "Parisian Tote Luxe",
    category: "Tote Bags",
    brand: "Maison Sac",
    price: 4999,
    discount: 10,
    stock: 25,
    material: "Full-Grain Leather",
    color: "Caramel",
    isFeatured: true,
    isTopPick: true,
    isTopSelling: true,
    description: "Effortlessly chic, this spacious tote brings Parisian elegance to everyday use. Crafted from premium full-grain leather with gold hardware.",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
    ],
    tags: ["tote", "luxury", "leather", "featured"],
    soldCount: 142,
  },
  {
    name: "Milano Shoulder Bag",
    category: "Shoulder Bags",
    brand: "LuxeCarry",
    price: 3499,
    discount: 0,
    stock: 30,
    material: "Italian Leather",
    color: "Black",
    isFeatured: true,
    isTopSelling: true,
    description: "A timeless shoulder bag inspired by the streets of Milan. Soft Italian leather with structured silhouette and adjustable strap.",
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?q=80&w=800",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800",
    ],
    tags: ["shoulder", "italian", "classic"],
    soldCount: 98,
  },
  {
    name: "Riviera Crossbody",
    category: "Crossbody Bags",
    brand: "UrbanEdge",
    price: 2299,
    discount: 15,
    stock: 40,
    material: "Pebbled Leather",
    color: "Blush Pink",
    isFeatured: true,
    isTopPick: true,
    description: "Light, versatile, and oh-so-stylish. This crossbody is perfect for day-to-night transitions with a pop of blush color.",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?q=80&w=800",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800",
    ],
    tags: ["crossbody", "casual", "colorful"],
    soldCount: 76,
  },
  {
    name: "Soirée Clutch",
    category: "Clutch Bags",
    brand: "Maison Sac",
    price: 1799,
    discount: 5,
    stock: 20,
    material: "Satin",
    color: "Champagne",
    isFeatured: true,
    isTopSelling: true,
    description: "Elevate your evening look with this lustrous satin clutch. Gold chain detail and magnetic closure for secure elegance.",
    images: [
      "https://images.unsplash.com/photo-1622560480654-d92214f1880e?q=80&w=800",
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?q=80&w=800",
    ],
    tags: ["clutch", "evening", "party"],
    soldCount: 55,
  },
  {
    name: "Urban Explorer Backpack",
    category: "Backpacks",
    brand: "UrbanEdge",
    price: 3999,
    discount: 20,
    stock: 15,
    material: "Canvas & Leather",
    color: "Olive Green",
    isFeatured: true,
    isTopPick: false,
    isTopSelling: true,
    description: "Built for the modern nomad. Spacious compartments, padded laptop sleeve, and water-resistant canvas with leather accents.",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800",
    ],
    tags: ["backpack", "travel", "canvas"],
    soldCount: 210,
  },
  {
    name: "Heritage Satchel",
    category: "Satchel Bags",
    brand: "ClassicHold",
    price: 5499,
    discount: 0,
    stock: 12,
    material: "Vegetable-Tanned Leather",
    color: "Cognac",
    isFeatured: true,
    isTopPick: true,
    description: "A heritage piece destined to be passed down. Vegetable-tanned leather develops a rich patina over time. Brass hardware and double-buckle closure.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
    ],
    tags: ["satchel", "heritage", "investment"],
    soldCount: 34,
  },
  {
    name: "Provence Bucket Bag",
    category: "Bucket Bags",
    brand: "LuxeCarry",
    price: 2999,
    discount: 10,
    stock: 22,
    material: "Suede",
    color: "Lavender",
    isFeatured: true,
    isTopSelling: true,
    description: "Soft suede bucket bag in dreamy lavender hue. Drawstring closure and detachable interior pouch. Summer romance in a bag.",
    images: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
    ],
    tags: ["bucket", "suede", "summer"],
    soldCount: 67,
  },
  {
    name: "Monaco Card Wallet",
    category: "Wallets",
    brand: "Maison Sac",
    price: 899,
    discount: 0,
    stock: 60,
    material: "Lambskin",
    color: "Ivory",
    isFeatured: false,
    isTopPick: true,
    description: "Slim and sophisticated. This compact card wallet in buttery lambskin holds up to 6 cards with a central cash slip.",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800",
      "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?q=80&w=800",
    ],
    tags: ["wallet", "slim", "card"],
    soldCount: 188,
  },
  {
    name: "Côte d'Azur Tote",
    category: "Tote Bags",
    brand: "LuxeCarry",
    price: 3299,
    discount: 8,
    stock: 18,
    material: "Canvas & Leather",
    color: "Navy Blue",
    isFeatured: true,
    isTopPick: true,
    description: "A chic summer tote inspired by the French Riviera. Canvas body with leather handles and a striped interior lining.",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
    ],
    tags: ["tote", "summer", "canvas"],
    soldCount: 45,
  },
  {
    name: "Venezia Shoulder Bag",
    category: "Shoulder Bags",
    brand: "ClassicHold",
    price: 4299,
    discount: 12,
    stock: 14,
    material: "Croc-Embossed Leather",
    color: "Wine Red",
    isFeatured: true,
    isTopSelling: true,
    description: "Inspired by the canals of Venice, this structured shoulder bag features a luxurious croc-embossed finish with gold chain accents.",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?q=80&w=800",
    ],
    tags: ["shoulder", "croc", "structured"],
    soldCount: 89,
  },
  {
    name: "Nomad Laptop Bag",
    category: "Backpacks",
    brand: "UrbanEdge",
    price: 4599,
    discount: 0,
    stock: 20,
    material: "Waxed Canvas",
    color: "Charcoal",
    isFeatured: true,
    isTopPick: true,
    description: "Designed for the professional nomad. Padded 15-inch laptop compartment, multiple pockets, and premium waxed canvas for all-weather durability.",
    images: [
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=800",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800",
    ],
    tags: ["laptop", "backpack", "professional"],
    soldCount: 156,
  },
  {
    name: "Santorini Crossbody Mini",
    category: "Crossbody Bags",
    brand: "Maison Sac",
    price: 1899,
    discount: 20,
    stock: 35,
    material: "Smooth Leather",
    color: "Cobalt Blue",
    isFeatured: true,
    isTopSelling: true,
    description: "A compact crossbody with big personality. The vivid cobalt blue smooth leather makes a bold statement with any outfit.",
    images: [
      "https://images.unsplash.com/photo-1575032617751-6ddec2089882?q=80&w=800",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?q=80&w=800",
    ],
    tags: ["crossbody", "mini", "bold"],
    soldCount: 121,
  },
];

const banners = [
  {
    title: "The Heritage Leather Collection",
    subtitle: "Discover luxury craftsmanship built for modern lifestyles. Handcrafted vegetable-tanned full grain cowhide pieces designed to age beautifully.",
    discountText: "UP TO 20% INTRODUCTORY OFF",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
    ctaText: "Shop Heritage",
    ctaLink: "/shop",
    badge: "NEW ARRIVAL",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Uncompromised Travel & Utility",
    subtitle: "Spacious, lightweight, water-resistant. Engineered for overnight adventures, weekend getaways, and smart airport commutes.",
    discountText: "COMPLIMENTARY SHIPPING INCLUDED",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1600",
    ctaText: "Explore Travel",
    ctaLink: "/shop?category=Backpacks",
    badge: "LIMITLESS ADVENTURES",
    isActive: true,
    sortOrder: 2,
  },
  {
    title: "Urban Commute Reinvented",
    subtitle: "Padded laptop compartments, ergonomic straps, and quick-access pockets. The perfect bags for creative professionals and students.",
    discountText: "FLAT 15% AUTOMATIC DISCOUNT",
    image: "https://images.unsplash.com/photo-1622560480654-d92214f1880e?q=80&w=1600",
    ctaText: "Browse Collection",
    ctaLink: "/shop",
    badge: "CREATIVE CLASS",
    isActive: true,
    sortOrder: 3,
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fashion Blogger",
    comment: "The quality is absolutely stunning. My Milano Shoulder Bag gets compliments everywhere I go. Worth every rupee!",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    rating: 5,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Ananya Kapoor",
    role: "Interior Designer",
    comment: "I've bought three bags from Maison Sac now and each one is more beautiful than the last. The leather quality is exceptional.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    rating: 5,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Ritu Mehra",
    role: "Marketing Executive",
    comment: "Fast delivery, beautiful packaging, and the bag looked even better in person. The Soirée Clutch was perfect for my event!",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    rating: 5,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Kavya Nair",
    role: "Architect",
    comment: "Finally found a bag brand that combines style with functionality. The Heritage Satchel fits my laptop and still looks elegant.",
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200",
    rating: 4,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Meera Iyer",
    role: "Creative Director",
    comment: "MAISON SAC is the only luxury brand that truly understands modern women. The Parisian Tote is my everyday companion.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    rating: 5,
    isActive: true,
    sortOrder: 5,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Banner.deleteMany({}),
      Testimonial.deleteMany({}),
      Brand.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const admin = await User.create({
      fullName: "Admin User",
      email: "admin@maisonsac.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log(`👤 Admin created: ${admin.email} / Admin@123`);

    // Create sample customer
    await User.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "Customer@123",
      role: "customer",
    });
    console.log("👤 Sample customer: jane@example.com / Customer@123");

    // Seed categories, brands, banners, testimonials, products
    await Category.insertMany(categories);
    console.log(`📁 ${categories.length} categories seeded`);

    await Brand.insertMany(brands);
    console.log(`🏷️  ${brands.length} brands seeded`);

    await Banner.insertMany(banners);
    console.log(`🖼️  ${banners.length} banners seeded`);

    await Testimonial.insertMany(testimonials);
    console.log(`💬 ${testimonials.length} testimonials seeded`);

    await Product.insertMany(products);
    console.log(`🛍️  ${products.length} products seeded`);

    console.log("\n✅ Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Login:    admin@maisonsac.com / Admin@123");
    console.log("Customer Login: jane@example.com / Customer@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
