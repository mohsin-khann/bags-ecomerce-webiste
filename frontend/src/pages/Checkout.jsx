import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
 ChevronRight,
 MapPin,
 CreditCard,
 CheckCircle,
 Package,
 Truck,
 ShieldCheck,
 Sparkles,
 ArrowLeft,
 Plus,
 Percent,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { orderService } from "../services/orderService";
import api from "../services/api";
import Breadcrumb from "../components/Breadcrumb";

const STEPS = ["Address", "Payment", "Review & Place"];

const PAYMENT_OPTIONS = [
 { id: "Cash On Delivery", label: "Cash On Delivery", icon: "💵", desc: "Pay when your order arrives" },
 { id: "Card", label: "Credit / Debit Card", icon: "💳", desc: "Secure card payment (demo)" },
 { id: "UPI", label: "UPI Transfer", icon: "📱", desc: "Pay via UPI ID (demo)" },
];

export default function Checkout() {
 const { cartItems, getCartTotal, clearCart } = useCart();
 const { user } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();

 const [step, setStep] = useState(0);
 const [placing, setPlacing] = useState(false);
 const [orderSuccess, setOrderSuccess] = useState(null);

 // Address
 const savedAddresses = user?.addresses || [];
 const [selectedAddrIdx, setSelectedAddrIdx] = useState(savedAddresses.findIndex((a) => a.isDefault) ?? 0);
 const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0);
 const [address, setAddress] = useState({
 fullName: user?.fullName || "",
 email: user?.email || "",
 phone: user?.phone || "",
 street: "",
 city: "",
 state: "",
 postalCode: "",
 country: "US",
 });

 // Payment
 const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");

 // Coupon
 const [couponCode, setCouponCode] = useState("");
 const [couponApplied, setCouponApplied] = useState(null);
 const [couponLoading, setCouponLoading] = useState(false);
 const [couponError, setCouponError] = useState("");

 const subtotal = getCartTotal();
 const shippingFee = subtotal >= 150 ? 0 : 15;
 const couponDiscount = couponApplied ? couponApplied.discount : 0;
 const tax = Math.round((subtotal - couponDiscount) * 0.08 * 100) / 100;
 const total = subtotal - couponDiscount + shippingFee + tax;

 useEffect(() => {
 if (cartItems.length === 0 && !orderSuccess) {
 navigate("/cart");
 }
 }, [cartItems, orderSuccess, navigate]);

 const getShippingAddress = () => {
 if (!useNewAddress && savedAddresses[selectedAddrIdx]) {
 const a = savedAddresses[selectedAddrIdx];
 return {
 fullName: a.fullName,
 email: user?.email || "",
 phone: a.phone || "",
 street: a.street || "",
 city: a.city || "",
 state: a.state || "",
 postalCode: a.postalCode || "",
 country: a.country || "US",
 };
 }
 return address;
 };

 const handleApplyCoupon = async (e) => {
 e.preventDefault();
 if (!couponCode.trim()) return;
 setCouponLoading(true);
 setCouponError("");
 try {
 const { data } = await api.post("/coupons/validate", { code: couponCode.trim().toUpperCase(), subtotal });
 setCouponApplied({ code: couponCode.trim().toUpperCase(), discount: data.discount || 0 });
 showToast(`Coupon applied — $${(data.discount || 0).toFixed(2)} off!`, "success");
 } catch (err) {
 setCouponError(err.response?.data?.message || "Invalid coupon code.");
 setCouponApplied(null);
 } finally {
 setCouponLoading(false);
 }
 };

 const handlePlaceOrder = async () => {
 const shippingAddress = getShippingAddress();
 if (!shippingAddress.fullName || !shippingAddress.email) {
 showToast("Please provide a valid shipping address.", "error");
 setStep(0);
 return;
 }
 setPlacing(true);
 try {
 const payload = {
 shippingAddress,
 paymentMethod,
 ...(couponApplied && { couponCode: couponApplied.code }),
 };
 const data = await orderService.placeOrder(payload);
 clearCart();
 setOrderSuccess(data.order);
 } catch (err) {
 showToast(err.response?.data?.message || "Failed to place order. Please try again.", "error");
 } finally {
 setPlacing(false);
 }
 };

 const validateStep = () => {
 if (step === 0) {
 const a = getShippingAddress();
 if (!a.fullName.trim() || !a.email.trim() || !a.street.trim() || !a.city.trim()) {
 showToast("Please fill in all required address fields.", "error");
 return false;
 }
 }
 return true;
 };

 const nextStep = () => {
 if (!validateStep()) return;
 setStep((s) => Math.min(s + 1, STEPS.length - 1));
 };

 if (orderSuccess) {
 return (
 <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="bg-white rounded-3xl border border-stone-150 shadow-xl max-w-md w-full p-8 text-center"
 >
 <div className="p-5 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100 inline-flex mx-auto mb-6">
 <CheckCircle className="w-12 h-12" />
 </div>
 <h2 className="font-sans font-black text-2xl text-stone-900 tracking-tight mb-2">
 Order Placed!
 </h2>
 <p className="text-xs text-stone-500 leading-relaxed mb-4">
 Thank you, <strong>{user?.fullName?.split(" ")[0]}</strong>! Your order has been confirmed.
 </p>
 <div className="bg-stone-900 text-amber-400 px-4 py-2.5 rounded-xl text-sm font-mono font-bold border border-stone-800 tracking-widest mb-6 inline-block">
 {orderSuccess.orderNumber}
 </div>
 <p className="text-[10px] text-stone-400 mb-8">
 A confirmation has been sent to <span className="underline">{orderSuccess.shippingAddress?.email}</span>. Estimated delivery in 5–7 business days.
 </p>
 <div className="flex flex-col gap-3">
 <Link
 to={`/orders/${orderSuccess._id}`}
 className="w-full flex items-center justify-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
 >
 <Package className="w-4 h-4" /> Track Order
 </Link>
 <Link
 to="/shop"
 className="w-full flex items-center justify-center gap-2 border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors"
 >
 Continue Shopping
 </Link>
 </div>
 </motion.div>
 </div>
 );
 }

 return (
 <div id="checkout-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
 <Breadcrumb items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />

 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
 <div className="flex items-center gap-3 mb-8">
 <Link to="/cart" className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <h1 className="font-sans font-black text-2xl text-stone-900 tracking-tight">Checkout</h1>
 </div>

 {/* Step Progress */}
 <div className="flex items-center gap-2 mb-8">
 {STEPS.map((s, i) => (
 <div key={s} className="flex items-center gap-2 flex-1">
 <div className={`flex items-center gap-2 ${i <= step ? "" : "opacity-40"}`}>
 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
 i < step ? "bg-emerald-500 text-white" : i === step ? "bg-amber-600 text-stone-950" : "bg-stone-200 text-stone-500"
 }`}>
 {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
 </div>
 <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${i === step ? "text-stone-900" : "text-stone-400"}`}>{s}</span>
 </div>
 {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded-full ${i < step ? "bg-emerald-500" : "bg-stone-200"}`} />}
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 {/* Form Area */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6">

 <AnimatePresence mode="wait">

 {/* STEP 0 — Address */}
 {step === 0 && (
 <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900 mb-5">
 Delivery Address
 </h2>

 {savedAddresses.length > 0 && (
 <div className="space-y-2 mb-5">
 {savedAddresses.map((a, idx) => (
 <button
 key={idx}
 onClick={() => { setSelectedAddrIdx(idx); setUseNewAddress(false); }}
 className={`w-full text-left p-3.5 rounded-xl border transition-all ${
 !useNewAddress && selectedAddrIdx === idx
 ? "border-amber-400 bg-amber-50/50"
 : "border-stone-200 hover:border-stone-300"
 }`}
 >
 <div className="flex items-start gap-3">
 <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
 !useNewAddress && selectedAddrIdx === idx ? "border-amber-500 bg-amber-500" : "border-stone-300"
 }`}>
 {!useNewAddress && selectedAddrIdx === idx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-stone-800">{a.fullName} <span className="font-mono text-[9px] text-stone-400 uppercase ml-1">{a.label}</span></p>
 <p className="text-[10px] text-stone-400 mt-0.5">{[a.street, a.city, a.state, a.country].filter(Boolean).join(", ")}</p>
 </div>
 </div>
 </button>
 ))}
 <button
 onClick={() => setUseNewAddress(true)}
 className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
 useNewAddress ? "border-amber-400 bg-amber-50/50" : "border-stone-200 hover:border-stone-300"
 }`}
 >
 <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${useNewAddress ? "border-amber-500 bg-amber-500" : "border-stone-300"}`}>
 {useNewAddress && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
 </div>
 <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
 <Plus className="w-3.5 h-3.5" /> Use a new address
 </span>
 </button>
 </div>
 )}

 {(useNewAddress || savedAddresses.length === 0) && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 { label: "Full Name *", key: "fullName", placeholder: "John Smith" },
 { label: "Email *", key: "email", type: "email", placeholder: "john@example.com" },
 ].map(({ label, key, type, placeholder }) => (
 <div key={key}>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">{label}</label>
 <input
 type={type || "text"}
 value={address[key]}
 onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
 placeholder={placeholder}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 ))}
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Phone</label>
 <input value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Street Address *</label>
 <input value={address.street} onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} placeholder="14 Belgrave Square" className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[["City *", "city", "London"], ["State", "state", "England"], ["ZIP", "postalCode", "SW1X 8PZ"], ["Country", "country", "US"]].map(([lbl, key, ph]) => (
 <div key={key}>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">{lbl}</label>
 <input value={address[key]} onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))} placeholder={ph} className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 ))}
 </div>
 </div>
 )}
 </motion.div>
 )}

 {/* STEP 1 — Payment */}
 {step === 1 && (
 <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900 mb-5">
 Payment Method
 </h2>
 <div className="space-y-3">
 {PAYMENT_OPTIONS.map((opt) => (
 <button
 key={opt.id}
 onClick={() => setPaymentMethod(opt.id)}
 className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
 paymentMethod === opt.id
 ? "border-amber-400 bg-amber-50/50"
 : "border-stone-200 hover:border-stone-300"
 }`}
 >
 <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === opt.id ? "border-amber-500 bg-amber-500" : "border-stone-300"}`}>
 {paymentMethod === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
 </div>
 <span className="text-xl">{opt.icon}</span>
 <div>
 <p className="text-xs font-bold text-stone-800">{opt.label}</p>
 <p className="text-[10px] text-stone-400">{opt.desc}</p>
 </div>
 </button>
 ))}
 </div>

 <div className="mt-6 pt-5 border-t border-stone-100">
 <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5">
 <Percent className="w-3.5 h-3.5 text-amber-500" /> Promo Code
 </h3>
 <form onSubmit={handleApplyCoupon} className="flex gap-2">
 <input
 type="text"
 placeholder="e.g. MAISONSAC15"
 value={couponCode}
 onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); setCouponApplied(null); }}
 className="flex-1 bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 <button type="submit" disabled={couponLoading} className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 uppercase tracking-wider">
 {couponLoading ? "..." : "Apply"}
 </button>
 </form>
 {couponError && <p className="text-[10px] text-rose-500 mt-1.5 font-mono">{couponError}</p>}
 {couponApplied && (
 <p className="text-[10px] text-emerald-600 mt-1.5 font-mono font-bold flex items-center gap-1">
 <CheckCircle className="w-3 h-3" /> Coupon applied — ${couponApplied.discount.toFixed(2)} off
 </p>
 )}
 </div>
 </motion.div>
 )}

 {/* STEP 2 — Review */}
 {step === 2 && (
 <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900 mb-5">
 Review Your Order
 </h2>

 {/* Items */}
 <div className="space-y-3 mb-5 pb-5 border-b border-stone-100">
 {cartItems.map((item, i) => {
 const price = item.product.price * (1 - (item.product.discount || 0) / 100);
 return (
 <div key={i} className="flex items-center gap-3">
 <img src={item.product.images?.[0]} alt={item.product.name} referrerPolicy="no-referrer" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/f5f5f4/a8a29e?text=."; }} className="w-12 h-12 rounded-xl object-cover border border-stone-100 shrink-0" />
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-stone-800 truncate">{item.product.name}</p>
 <p className="text-[10px] text-stone-400 font-mono">×{item.quantity}</p>
 </div>
 <span className="font-mono font-bold text-xs text-stone-900 shrink-0">${(price * item.quantity).toFixed(2)}</span>
 </div>
 );
 })}
 </div>

 {/* Delivery summary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
 <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Delivering To</p>
 {(() => {
 const a = getShippingAddress();
 return (
 <div className="text-stone-700 space-y-0.5">
 <p className="font-bold">{a.fullName}</p>
 <p>{a.street}</p>
 <p>{[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}</p>
 <p>{a.country}</p>
 </div>
 );
 })()}
 </div>
 <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment</p>
 <p className="font-bold text-stone-700">{paymentMethod}</p>
 {couponApplied && <p className="text-[10px] text-emerald-600 mt-1 font-mono">Coupon: {couponApplied.code}</p>}
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 text-[10px] text-stone-400">
 <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
 <span>All orders are fully insured and dispatched in tamper-proof luxury packaging within 24 hours.</span>
 </div>
 </motion.div>
 )}

 </AnimatePresence>

 {/* Navigation Buttons */}
 <div className="flex items-center justify-between mt-8 pt-5 border-t border-stone-100">
 <button
 onClick={() => step > 0 ? setStep((s) => s - 1) : navigate("/cart")}
 className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Back to Cart" : "Back"}
 </button>

 {step < STEPS.length - 1 ? (
 <button
 onClick={nextStep}
 className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
 >
 Continue <ChevronRight className="w-4 h-4" />
 </button>
 ) : (
 <button
 onClick={handlePlaceOrder}
 disabled={placing}
 className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md disabled:opacity-60"
 >
 {placing ? "Placing..." : <>Place Order <CheckCircle className="w-4 h-4" /></>}
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Order Summary Sidebar */}
 <div className="space-y-4">
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-5 sticky top-6">
 <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-4 pb-3 border-b border-stone-100">
 Order Summary
 </h2>
 <div className="space-y-2.5 text-xs text-stone-600">
 <div className="flex justify-between">
 <span>Subtotal ({cartItems.length} items)</span>
 <span className="font-mono font-bold text-stone-900">${subtotal.toFixed(2)}</span>
 </div>
 {couponDiscount > 0 && (
 <div className="flex justify-between text-emerald-600">
 <span>Coupon Discount</span>
 <span className="font-mono font-bold">-${couponDiscount.toFixed(2)}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> Shipping</span>
 <span className="font-mono font-bold text-stone-900">
 {shippingFee === 0 ? <span className="text-emerald-600 text-[10px] uppercase font-bold tracking-wide">Free</span> : `$${shippingFee.toFixed(2)}`}
 </span>
 </div>
 <div className="flex justify-between">
 <span>Tax (8%)</span>
 <span className="font-mono font-bold text-stone-900">${tax.toFixed(2)}</span>
 </div>
 <div className="flex justify-between pt-3 border-t border-stone-100 text-sm font-black text-stone-900">
 <span>Total</span>
 <span className="font-mono text-amber-600">${total.toFixed(2)}</span>
 </div>
 </div>

 {shippingFee > 0 && (
 <p className="text-[10px] text-stone-400 mt-3 leading-relaxed">
 Add <span className="font-mono font-bold text-amber-600">${(150 - subtotal).toFixed(2)}</span> more for free shipping.
 </p>
 )}

 <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[10px] text-stone-400">
 <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
 <span>Secured checkout — SSL encrypted</span>
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}
