import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import * as R from "../utils/apiResponse.js";

const populateCart = (cart) =>
  cart.populate({ path: "items.product", select: "name images price discount category brand stock" });

export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  await populateCart(cart);
  R.success(res, { cart });
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1, selectedColor } = req.body;

  const product = await Product.findById(productId);
  if (!product) return R.error(res, "Product not found", 404);
  if (product.stock < 1) return R.error(res, "Product is out of stock", 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.selectedColor === selectedColor
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, selectedColor, price: product.price });
  }

  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Added to cart");
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  const item = cart.items.id(itemId);
  if (!item) return R.error(res, "Cart item not found", 404);

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Cart updated");
};

export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  const item = cart.items.id(itemId);
  if (!item) return R.error(res, "Cart item not found", 404);

  item.deleteOne();
  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Item removed");
};

export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    await cart.save();
  }
  R.success(res, { cart: cart || { items: [] } }, "Cart cleared");
};

export const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return R.error(res, "Invalid coupon code", 400);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const validation = coupon.isValid(subtotal, req.user._id);
  if (!validation.valid) return R.error(res, validation.message, 400);

  const discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  cart.couponCode = coupon.code;
  cart.couponDiscount = Math.min(discount, subtotal);
  await cart.save();

  R.success(res, { cart, discount: cart.couponDiscount }, "Coupon applied");
};
