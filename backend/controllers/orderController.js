import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import * as R from "../utils/apiResponse.js";
import { ORDER_STATUSES } from "../constants/index.js";

export const placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) return R.error(res, "Cart is empty", 400);

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0] || "",
    price: item.price,
    quantity: item.quantity,
    selectedColor: item.selectedColor,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 15;

  let couponDiscount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(subtotal, req.user._id);
      if (validation.valid) {
        couponDiscount =
          coupon.discountType === "percentage"
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  // Tax applied after coupon discount — matches the frontend checkout calculation
  const taxableAmount = subtotal - couponDiscount;
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = taxableAmount + shippingFee + tax;

  // Estimate delivery 5–7 business days from now
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash On Delivery",
    couponCode: couponCode?.toUpperCase(),
    couponDiscount,
    subtotal,
    shippingFee,
    tax,
    total,
    estimatedDelivery,
    statusHistory: [{ status: ORDER_STATUSES.PENDING, note: "Order placed successfully" }],
    trackingSteps: [
      {
        status: ORDER_STATUSES.PENDING,
        title: "Order Placed",
        description: "Your order has been received and is awaiting confirmation.",
        timestamp: new Date(),
        isCompleted: true,
      },
    ],
  });

  // Decrement stock and increment soldCount
  await Promise.all(
    cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      })
    )
  );

  // Clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  R.created(res, { order }, "Order placed successfully");
};

export const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort("-createdAt").skip(skip).limit(Number(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);

  R.paginated(res, orders, total, page, limit);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "fullName email");

  if (!order) return R.error(res, "Order not found", 404);

  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return R.error(res, "Not authorized", 403);

  R.success(res, { order });
};

export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "fullName email avatar")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  R.paginated(res, orders, total, page, limit);
};

export const updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery, trackingStep } = req.body;

  const allStatuses = Object.values(ORDER_STATUSES);
  if (!allStatuses.includes(status)) {
    return R.error(res, `Invalid status. Must be one of: ${allStatuses.join(", ")}`, 400);
  }

  const updateFields = {
    orderStatus: status,
    $push: { statusHistory: { status, note: note || "" } },
  };

  if (status === ORDER_STATUSES.DELIVERED) {
    updateFields.paymentStatus = "Paid";
    updateFields.deliveredAt = new Date();
  }
  if (status === ORDER_STATUSES.CANCELLED) {
    updateFields.cancelledAt = new Date();
  }
  if (status === ORDER_STATUSES.RETURNED) {
    updateFields.returnedAt = new Date();
  }
  if (trackingNumber) updateFields.trackingNumber = trackingNumber;
  if (estimatedDelivery) updateFields.estimatedDelivery = new Date(estimatedDelivery);

  if (trackingStep) {
    updateFields.$push.trackingSteps = {
      status,
      title: trackingStep.title || status,
      description: trackingStep.description || note || "",
      location: trackingStep.location || "",
      timestamp: new Date(),
      isCompleted: true,
    };
  }

  const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true }).populate(
    "user",
    "fullName email"
  );

  if (!order) return R.error(res, "Order not found", 404);
  R.success(res, { order }, "Order status updated");
};

export const addTrackingUpdate = async (req, res) => {
  const { title, description, location, status } = req.body;
  if (!title) return R.error(res, "Tracking title is required", 400);

  const order = await Order.findById(req.params.id);
  if (!order) return R.error(res, "Order not found", 404);

  const step = {
    status: status || order.orderStatus,
    title,
    description: description || "",
    location: location || "",
    timestamp: new Date(),
    isCompleted: true,
  };

  order.trackingSteps.push(step);
  await order.save();

  R.success(res, { order }, "Tracking update added");
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return R.error(res, "Order not found", 404);

  const isOwner = order.user?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") return R.error(res, "Not authorized", 403);

  if ([ORDER_STATUSES.SHIPPED, ORDER_STATUSES.OUT_FOR_DELIVERY, ORDER_STATUSES.DELIVERED].includes(order.orderStatus)) {
    return R.error(res, "Cannot cancel an order that has been shipped or delivered", 400);
  }

  order.orderStatus = ORDER_STATUSES.CANCELLED;
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: ORDER_STATUSES.CANCELLED, note: req.body.note || "Cancelled by user" });
  order.trackingSteps.push({
    status: ORDER_STATUSES.CANCELLED,
    title: "Order Cancelled",
    description: req.body.note || "The order has been cancelled.",
    timestamp: new Date(),
    isCompleted: true,
  });

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      })
    )
  );

  await order.save();
  R.success(res, { order }, "Order cancelled");
};
