import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
 ShoppingBag, Heart, Search, Menu, X, Sparkles, User, LogOut,
 Settings, ClipboardList, Shield, LogIn, UserPlus,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
 const navigate = useNavigate();
 const { getCartCount } = useCart();
 const { wishlistItems } = useWishlist();
 const { isAuthenticated, user, logout } = useAuth();
 const { showToast } = useToast();

 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);

 const cartCount = getCartCount();
 const wishlistCount = wishlistItems.length;

 useEffect(() => {
 function handleClickOutside(event) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setAccountDropdownOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSearchSubmit = (e) => {
 e.preventDefault();
 if (!searchQuery.trim()) return;
 navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
 setSearchQuery("");
 setSearchOpen(false);
 };

 const handleLogoutClick = async () => {
 await logout();
 setAccountDropdownOpen(false);
 showToast("Successfully signed out. Have a nice day!", "success");
 navigate("/");
 };

 const standardLinks = [
 { label: "Home", to: "/" },
 { label: "Shop", to: "/shop" },
 { label: "About Us", to: "/about" },
 { label: "Contact", to: "/contact" },
 ];

 const getUserInitials = () => {
 if (!user?.fullName) return "M";
 return user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
 };

 return (
 <>
 <div className="bg-stone-950 text-white py-2 px-4 text-center text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
 <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
 <span>Free Priority Shipping On Orders Over $150 • Enjoy 15% Welcome Discount</span>
 <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
 </div>

 <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-300">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setMobileMenuOpen(true)}
 className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors md:hidden"
 aria-label="Open menu"
 >
 <Menu className="w-6 h-6" />
 </button>
 <Link to="/" className="flex items-baseline gap-1 group">
 <span className="font-sans font-extrabold text-lg sm:text-2xl tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors">
 MAISON
 </span>
 <span className="text-amber-500 font-mono text-xs font-semibold tracking-widest uppercase">SAC</span>
 </Link>
 </div>

 <nav className="hidden md:flex items-center gap-8 lg:gap-10">
 {standardLinks.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 className={({ isActive }) =>
 `text-xs lg:text-sm font-semibold tracking-widest uppercase transition-all duration-300 border-b-2 py-1.5 ${
 isActive
 ? "border-amber-500 text-stone-950"
 : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-200"
 }`
 }
 >
 {link.label}
 </NavLink>
 ))}
 </nav>

 <div className="flex items-center gap-2 sm:gap-4">
 <button
 onClick={() => setSearchOpen(!searchOpen)}
 className="p-2 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300"
 aria-label="Toggle search"
 >
 <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
 </button>

 <Link
 to="/wishlist"
 className="p-2 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300 relative"
 aria-label="Wishlist"
 >
 <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
 {wishlistCount > 0 && (
 <span className="absolute top-1 right-1 bg-stone-950 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
 {wishlistCount}
 </span>
 )}
 </Link>

 <Link
 to="/cart"
 className="p-2 sm:px-3 sm:py-2 bg-stone-950 hover:bg-stone-850 text-stone-100 hover:text-white rounded-full sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 relative border border-stone-900 shadow-md mr-1"
 aria-label="Cart"
 >
 <ShoppingBag className="w-4 h-4 text-amber-400" />
 <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase text-white">Bag</span>
 <span className="bg-white text-stone-950 font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-stone-800">
 {cartCount}
 </span>
 </Link>

 <div className="relative" ref={dropdownRef}>
 {isAuthenticated ? (
 <button
 onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
 className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#8c6d3f] text-white hover:bg-[#5e492b] rounded-xl border border-amber-600/20 font-bold text-xs tracking-tight uppercase shadow-xs transition-colors"
 >
 {getUserInitials()}
 </button>
 ) : (
 <div className="hidden sm:flex items-center gap-3">
 <Link
 to="/login"
 className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-stone-600 hover:text-[#8c6d3f] px-3 py-2 rounded-lg transition-all duration-200"
 >
 <LogIn className="w-3.5 h-3.5" />
 Sign In
 </Link>
 <Link
 to="/register"
 className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase bg-stone-950 hover:bg-[#8c6d3f] text-white px-4.5 py-2 rounded-full border border-transparent shadow-md hover:shadow-lg transition-all duration-200"
 >
 <UserPlus className="w-3.5 h-3.5" />
 Register
 </Link>
 </div>
 )}

 {!isAuthenticated && (
 <Link
 to="/login"
 className="sm:hidden p-2.5 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-50 border border-stone-200"
 aria-label="Sign In"
 >
 <LogIn className="w-5 h-5" />
 </Link>
 )}

 <AnimatePresence>
 {accountDropdownOpen && isAuthenticated && user && (
 <motion.div
 initial={{ opacity: 0, y: 15, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 15, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-3 w-64 bg-white border border-stone-150 rounded-2xl shadow-xl z-50 p-2 overflow-hidden text-xs text-stone-800"
 >
 <div className="px-3.5 py-3 border-b border-stone-100 bg-stone-50 rounded-xl mb-1.5">
 <div className="font-bold text-stone-900 truncate">{user.fullName}</div>
 <div className="text-[10px] text-stone-400 truncate mb-1">{user.email}</div>
 <span className={`inline-block font-mono text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
 user.role === "admin"
 ? "bg-amber-600/15 text-amber-655 border border-amber-600/25"
 : "bg-stone-100 text-stone-500"
 }`}>
 {user.role === "admin" ? "Concierge Admin" : "Atelier Member"}
 </span>
 </div>

 <div className="space-y-0.5">
 {user.role === "admin" && (
 <Link
 to="/admin/dashboard"
 onClick={() => setAccountDropdownOpen(false)}
 className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 hover:bg-amber-600/10 hover:text-amber-700 font-semibold transition-colors"
 >
 <Shield className="w-4 h-4 text-amber-500" />
 <span>Admin Dashboard</span>
 </Link>
 )}
 <Link
 to="/orders"
 onClick={() => setAccountDropdownOpen(false)}
 className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold transition-colors"
 >
 <ClipboardList className="w-4 h-4 text-stone-450" />
 <span>My Orders</span>
 </Link>
 <Link
 to="/account"
 onClick={() => setAccountDropdownOpen(false)}
 className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold transition-colors"
 >
 <Settings className="w-4 h-4 text-stone-450" />
 <span>Profile Settings</span>
 </Link>
 <button
 onClick={handleLogoutClick}
 className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left mt-1 border-t border-stone-100 pt-2"
 >
 <LogOut className="w-4 h-4 text-rose-550" />
 <span>Sign Out</span>
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>

 <AnimatePresence>
 {searchOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden bg-stone-50 border-b border-stone-200"
 >
 <form
 onSubmit={handleSearchSubmit}
 className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3"
 >
 <Search className="w-5 h-5 text-stone-400" />
 <input
 type="text"
 placeholder="Search bags, leather wallets, materials..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-transparent border-none text-stone-800 placeholder-stone-400 font-sans font-medium outline-none text-sm py-1.5"
 autoFocus
 />
 {searchQuery && (
 <button
 type="button"
 onClick={() => setSearchQuery("")}
 className="p-1 rounded-full hover:bg-stone-200 text-stone-500"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 <button
 type="submit"
 className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-lg font-mono tracking-wider uppercase transition-colors"
 >
 Go
 </button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>
 </header>

 <AnimatePresence>
 {mobileMenuOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setMobileMenuOpen(false)}
 className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs"
 />
 <motion.div
 initial={{ x: "-100%" }}
 animate={{ x: 0 }}
 exit={{ x: "-100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 220 }}
 className="fixed inset-y-0 left-0 max-w-xs w-full z-50 bg-white border-r shadow-2xl p-6 flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between pb-6 border-b border-stone-100">
 <div className="flex items-baseline gap-1">
 <span className="font-sans font-extrabold text-xl tracking-tight text-stone-950">MAISON</span>
 <span className="text-amber-500 font-mono text-xxs font-bold tracking-widest uppercase">SAC</span>
 </div>
 <button
 onClick={() => setMobileMenuOpen(false)}
 className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <nav className="flex flex-col gap-6 pt-8">
 {standardLinks.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 onClick={() => setMobileMenuOpen(false)}
 className={({ isActive }) =>
 `text-sm font-bold tracking-widest uppercase py-1 transition-colors ${
 isActive ? "text-amber-600" : "text-stone-700 hover:text-stone-950"
 }`
 }
 >
 {link.label}
 </NavLink>
 ))}
 {isAuthenticated && user?.role === "admin" && (
 <NavLink
 to="/admin/dashboard"
 onClick={() => setMobileMenuOpen(false)}
 className="text-sm font-bold tracking-widest uppercase py-1 text-amber-600 flex items-center gap-2 border-t border-stone-100 pt-4"
 >
 <Shield className="w-4 h-4" />
 Admin Dashboard
 </NavLink>
 )}
 </nav>
 </div>

 <div className="pt-6 border-t border-stone-100 flex flex-col gap-4">
 {!isAuthenticated ? (
 <div className="flex flex-col gap-2">
 <Link
 to="/login"
 onClick={() => setMobileMenuOpen(false)}
 className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase text-white bg-stone-950 py-3 rounded-xl shadow-xs transition-colors"
 >
 <LogIn className="w-4 h-4" />
 Sign In
 </Link>
 <Link
 to="/register"
 onClick={() => setMobileMenuOpen(false)}
 className="flex items-center justify-center gap-1 text-xs font-bold tracking-widest uppercase text-stone-750 bg-stone-50 hover:bg-stone-100 border border-stone-200 py-2.5 rounded-xl transition-colors"
 >
 <UserPlus className="w-4 h-4 text-stone-500" />
 Register Account
 </Link>
 </div>
 ) : (
 <div className="flex flex-col gap-2">
 <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-1">
 <p className="text-xs font-bold text-stone-900 truncate">{user.fullName}</p>
 <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
 </div>
 <Link
 to="/orders"
 onClick={() => setMobileMenuOpen(false)}
 className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-150 text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors"
 >
 <span>My Orders</span>
 <ClipboardList className="w-4 h-4 text-stone-450" />
 </Link>
 <Link
 to="/account"
 onClick={() => setMobileMenuOpen(false)}
 className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-150 text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors"
 >
 <span>Profile Settings</span>
 <User className="w-4 h-4 text-stone-450" />
 </Link>
 <button
 onClick={handleLogoutClick}
 className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase text-white bg-rose-600 hover:bg-rose-750 py-3 rounded-xl transition-colors mt-2 shadow-sm"
 >
 <LogOut className="w-4 h-4" />
 Sign Out
 </button>
 </div>
 )}
 <Link
 to="/wishlist"
 onClick={() => setMobileMenuOpen(false)}
 className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-150 transition-colors"
 >
 <span className="text-xs font-bold uppercase tracking-wider text-stone-750 flex items-center gap-2">
 <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
 My Wishlist
 </span>
 <span className="bg-stone-250 text-stone-850 text-xxs font-bold px-2 py-0.5 rounded-full font-mono">{wishlistCount}</span>
 </Link>
 <p className="text-xxs text-stone-450 font-medium leading-relaxed">
 © {new Date().getFullYear()} Maison de Sac Luxury Products. All rights reserved.
 </p>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </>
 );
}
