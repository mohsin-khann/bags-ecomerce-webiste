import { useState } from "react";
import { Link } from "react-router-dom";
import {
 ShoppingBag,
 Trash2,
 ArrowRight,
 Percent,
 Sparkles,
 Truck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";
import api from "../services/api";

export default function Cart() {
 const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
 const { showToast } = useToast();

 const [couponCode, setCouponCode] = useState("");
 const [appliedDiscount, setAppliedDiscount] = useState(0);
 const [appliedCouponCode, setAppliedCouponCode] = useState("");
 const [couponFeedback, setCouponFeedback] = useState("");
 const [couponLoading, setCouponLoading] = useState(false);

 const subtotal = getCartTotal();

 const shippingThreshold = 150;
 const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 15.0;

 const handleApplyCoupon = async (e) => {
 e.preventDefault();
 const cleanCode = couponCode.trim().toUpperCase();
 if (!cleanCode) return;

 setCouponLoading(true);
 setCouponFeedback("");
 try {
 const { data } = await api.post("/coupons/validate", { code: cleanCode, subtotal });
 const discountValue = data.discount || 0;
 setAppliedDiscount(discountValue / subtotal);
 setAppliedCouponCode(cleanCode);
 setCouponFeedback(`Coupon ${cleanCode} applied! You save $${discountValue.toFixed(2)}.`);
 showToast(`Coupon applied — $${discountValue.toFixed(2)} off!`, "success");
 } catch (err) {
 const msg = err.response?.data?.message || "Invalid discount coupon code.";
 setCouponFeedback(msg);
 setAppliedDiscount(0);
 setAppliedCouponCode("");
 } finally {
 setCouponLoading(false);
 }
 };

 const discountAmount = subtotal * appliedDiscount;
 const taxableBasis = subtotal - discountAmount;
 const taxCost = taxableBasis * 0.08;
 const grandTotal = taxableBasis + shippingCost + taxCost;


 return (
 <div id="cart-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
 <Breadcrumb items={[{ label: "Shopping Bag" }]} />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
 <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight mb-8 flex items-center gap-3">
 Your Shopping Bag
 <span className="text-sm font-semibold tracking-widest font-mono text-stone-400 uppercase">
 ({cartItems.length} Models)
 </span>
 </h1>

 {cartItems.length > 0 ? (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

 {/* LEFT COLUMN: LIST OF BAGGED ITEMS (8 Cols) */}
 <div className="lg:col-span-8 flex flex-col gap-4">
 {cartItems.map((item) => {
 const finalProductPrice = item.product.price * (1 - item.product.discount / 100);
 const itemTotal = finalProductPrice * item.quantity;
 return (
 <div
 key={item.product.id}
 className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-150 shadow-xxs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between animate-fade-in"
 >
 <div className="flex items-center gap-4 w-full sm:w-auto">
 <Link
 to={`/product/${item.product.id}`}
 className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100"
 >
 <img
 src={item.product.images?.[0]}
 alt={item.product.name}
 referrerPolicy="no-referrer"
 onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/f5f5f4/a8a29e?text=."; }}
 className="w-full h-full object-cover object-center"
 />
 </Link>

 <div>
 <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">
 {item.product.brand}
 </span>
 <Link to={`/product/${item.product.id}`} className="hover:text-amber-600 transition-colors">
 <h3 className="font-sans font-bold text-sm text-stone-900 leading-snug">
 {item.product.name}
 </h3>
 </Link>
 <div className="flex gap-4 text-xxs text-stone-400 mt-1.5 font-mono">
 <span>COLOR: <strong className="text-stone-900">{item.selectedColor || item.product.color}</strong></span>
 <span>MATERIAL: <strong className="text-stone-900">{item.product.material}</strong></span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto">
 <div className="flex items-center border border-stone-200 rounded-lg px-2 bg-stone-50">
 <button
 onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
 className="p-1 px-2 text-stone-500 hover:text-stone-900 font-bold"
 >
 -
 </button>
 <span className="w-6 text-center text-xs font-bold font-mono text-stone-855">
 {item.quantity}
 </span>
 <button
 onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
 className="p-1 px-2 text-stone-500 hover:text-stone-900 font-bold"
 >
 +
 </button>
 </div>

 <div className="text-right">
 <span className="text-sm font-bold text-stone-900 font-mono block">
 ${itemTotal.toFixed(2)}
 </span>
 {item.quantity > 1 && (
 <span className="text-[10px] text-stone-400 font-mono">
 ${finalProductPrice.toFixed(2)} each
 </span>
 )}
 </div>

 <button
 onClick={() => {
 removeFromCart(item.product.id);
 showToast(`Removed "${item.product.name}" from shopping cart.`, "info");
 }}
 className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-50 rounded-lg transition-all"
 title="Remove model"
 >
 <Trash2 className="w-4.5 h-4.5" />
 </button>
 </div>
 </div>
 );
 })}
 </div>

 {/* RIGHT COLUMN: REVENUE CALCULATIONS & CTAs (4 Cols) */}
 <div className="lg:col-span-4 flex flex-col gap-6">
 <div className="bg-white border border-stone-150 rounded-2xl p-6 shadow-xs">
 <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 mb-4 pb-2 border-b border-stone-100">
 Bill Summary
 </h3>

 <div className="space-y-3.5 text-xs text-stone-605 font-sans">
 <div className="flex justify-between">
 <span>Bag Subtotal</span>
 <span className="font-mono font-bold text-stone-900">${subtotal.toFixed(2)}</span>
 </div>

 {appliedDiscount > 0 && (
 <div className="flex justify-between text-amber-600 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-100">
 <span className="flex items-center gap-1">
 <Sparkles className="w-3.5 h-3.5" /> Promo Discount (15%)
 </span>
 <span className="font-mono text-right">-${discountAmount.toFixed(2)}</span>
 </div>
 )}

 <div className="flex justify-between">
 <span className="flex items-center gap-1.5">
 <Truck className="w-3.5 h-3.5 text-stone-400" /> Courier Shipping
 </span>
 <span className="font-mono text-stone-900">
 {shippingCost === 0 ? (
 <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase text-[10px] border border-emerald-100/30">
 Complimentary
 </span>
 ) : (
 `$${shippingCost.toFixed(2)}`
 )}
 </span>
 </div>

 {shippingCost > 0 && (
 <p className="text-[10px] text-stone-400 leading-normal font-serif">
 Add <span className="font-mono font-bold text-stone-650">${(shippingThreshold - subtotal).toFixed(2)}</span> more to qualify for complimentary priority dispatch.
 </p>
 )}

 <div className="flex justify-between">
 <span>Estimated Sales Tax (8%)</span>
 <span className="font-mono text-stone-900">${taxCost.toFixed(2)}</span>
 </div>

 <div className="flex justify-between pt-4 border-t border-stone-100 text-sm font-black text-stone-900">
 <span className="uppercase tracking-wider">Estimated Total</span>
 <span className="font-mono text-base text-stone-950">${grandTotal.toFixed(2)}</span>
 </div>
 </div>

 <Link
 to="/checkout"
 className="w-full bg-stone-950 hover:bg-stone-800 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-6 flex items-center justify-center gap-2 shadow-lg"
 >
 Proceed to Checkout
 <ArrowRight className="w-4 h-4 text-amber-400" />
 </Link>
 </div>

 <div className="bg-white border border-stone-150 rounded-2xl p-5 shadow-xs">
 <h4 className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-3 flex items-center gap-1">
 <Percent className="w-4.5 h-4.5 text-amber-500" /> Claim Promo Code
 </h4>
 <form onSubmit={handleApplyCoupon} className="flex gap-2 p-1.5 bg-stone-50 border border-stone-200 rounded-xl focus-within:ring-1 focus-within:ring-amber-500">
 <input
 type="text"
 placeholder="Enter code (e.g., MAISONSAC15)"
 value={couponCode}
 onChange={(e) => setCouponCode(e.target.value)}
 className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 border-none outline-none font-sans px-2"
 />
 <button
 type="submit"
 disabled={couponLoading}
 className="bg-stone-900 hover:bg-stone-800 text-white text-[9px] font-bold px-3.5 py-2.5 rounded-lg uppercase tracking-wider shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {couponLoading ? "..." : "Apply"}
 </button>
 </form>

 {couponFeedback && (
 <p className={`text-[10px] font-mono mt-2.5 ${appliedDiscount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
 {couponFeedback}
 </p>
 )}
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-stone-150 max-w-xl mx-auto py-20 px-6 text-center flex flex-col items-center gap-4 my-8 shadow-xs">
 <div className="p-4 bg-stone-100 rounded-full text-stone-400">
 <ShoppingBag className="w-10 h-10" />
 </div>
 <h2 className="font-sans font-black text-xl text-stone-900">Your shopping bag is empty</h2>
 <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
 Before checking out or viewing shipping estimates, browse through our limited boutique collections and save items of choice to your basket!
 </p>
 <Link
 to="/shop"
 className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md mt-2 inline-flex items-center gap-1.5"
 >
 Browse Shop Collection
 <ArrowRight className="w-4 h-4 text-amber-400 font-bold" />
 </Link>
 </div>
 )}
 </div>

 </div>
 );
}
