import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(undefined);

/* ─── Per-user localStorage helpers ─── */
const getUserKey = (userId) => (userId ? `msac_cart_${userId}` : null);

const readUserLocal = (userId) => {
 const key = getUserKey(userId);
 if (!key) return [];
 try {
 const s = localStorage.getItem(key);
 const parsed = JSON.parse(s);
 return Array.isArray(parsed) ? parsed : [];
 } catch {
 return [];
 }
};

const normalizeServerItems = (raw) =>
 (raw.items || raw || []).map((item) => {
 const product = item.product || item;
 return {
 _id: item._id,
 product: product._id ? { ...product, id: product.id || product._id } : product,
 quantity: item.quantity ?? 1,
 selectedColor: item.selectedColor || product.color,
 };
 });

export function CartProvider({ children }) {
 const { user, isAuthenticated, isLoading } = useAuth();
 const userId = user?._id || user?.id;

 const [cartItems, setCartItems] = useState([]);

 /* ─── Server sync ─── */
 const syncFromServer = useCallback(async () => {
 try {
 const serverCart = await cartService.getCart();
 setCartItems(normalizeServerItems(serverCart));
 } catch {
 // Keep current in-memory state — server might be offline
 }
 }, []);

 /* ─── React to auth state changes ─── SECURITY: isolate per user */
 useEffect(() => {
 if (isLoading) return;

 if (isAuthenticated && userId) {
 // Load this user's cached cart from localStorage
 const cached = readUserLocal(userId);
 setCartItems(cached);
 // Then override with authoritative server data
 syncFromServer();
 } else {
 // Logged out — clear all cart state (prevents data leakage)
 setCartItems([]);
 }
 }, [isAuthenticated, userId, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

 /* ─── Persist to user-scoped localStorage ─── */
 useEffect(() => {
 const key = getUserKey(userId);
 if (key) {
 localStorage.setItem(key, JSON.stringify(cartItems));
 }
 }, [cartItems, userId]);

 /* ─── Actions ─── */
 const addToCart = async (product, quantity = 1, selectedColor) => {
 setCartItems((prev) => {
 const pid = product._id || product.id;
 const idx = prev.findIndex(
 (i) => (i.product._id || i.product.id) === pid
 );
 if (idx > -1) {
 const updated = [...prev];
 updated[idx] = {
 ...updated[idx],
 quantity: Math.min(product.stock || 99, updated[idx].quantity + quantity),
 };
 return updated;
 }
 return [
 ...prev,
 { product, quantity, selectedColor: selectedColor || product.color },
 ];
 });

 if (isAuthenticated) {
 try {
 const serverCart = await cartService.addToCart(product._id || product.id, quantity, selectedColor);
 // Sync server item _ids back so remove/update calls work
 setCartItems(normalizeServerItems(serverCart));
 } catch {
 // Silent fail — optimistic update already applied
 }
 }
 };

 const removeFromCart = async (productId) => {
 const cartItemId = cartItems.find(
 (i) => (i.product._id || i.product.id) === productId
 )?._id;

 setCartItems((prev) =>
 prev.filter((i) => (i.product._id || i.product.id) !== productId)
 );

 if (isAuthenticated && cartItemId) {
 try {
 await cartService.removeFromCart(cartItemId);
 } catch {
 // Silent fail
 }
 }
 };

 const updateQuantity = async (productId, quantity) => {
 if (quantity <= 0) {
 removeFromCart(productId);
 return;
 }

 const cartItemId = cartItems.find(
 (i) => (i.product._id || i.product.id) === productId
 )?._id;

 setCartItems((prev) =>
 prev.map((i) =>
 (i.product._id || i.product.id) === productId
 ? { ...i, quantity: Math.min(i.product.stock || 99, quantity) }
 : i
 )
 );

 if (isAuthenticated && cartItemId) {
 try {
 await cartService.updateQuantity(cartItemId, quantity);
 } catch {
 // Silent fail
 }
 }
 };

 const clearCart = async () => {
 setCartItems([]);
 if (isAuthenticated) {
 try {
 await cartService.clearCart();
 } catch {
 // Silent fail
 }
 }
 };

 const getCartTotal = () =>
 cartItems.reduce((acc, item) => {
 const p = item.product;
 const discounted = p.price * (1 - (p.discount || 0) / 100);
 return acc + discounted * item.quantity;
 }, 0);

 const getCartCount = () =>
 cartItems.reduce((acc, item) => acc + item.quantity, 0);

 return (
 <CartContext.Provider
 value={{
 cartItems,
 addToCart,
 removeFromCart,
 updateQuantity,
 clearCart,
 getCartTotal,
 getCartCount,
 syncFromServer,
 }}
 >
 {children}
 </CartContext.Provider>
 );
}

export function useCart() {
 const ctx = useContext(CartContext);
 if (!ctx) throw new Error("useCart must be used within a CartProvider");
 return ctx;
}
