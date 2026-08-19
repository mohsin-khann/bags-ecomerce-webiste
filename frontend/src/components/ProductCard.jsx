import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import Rating from "./Rating";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);

  const productId = product._id || product.id;
  const price = product.price ?? 0;
  const discount = product.discount ?? 0;
  const discountPrice = price * (1 - discount / 100);
  const isSaved = isInWishlist(productId);
  const isOutOfStock = (product.stock ?? 1) <= 0;
  const img0 = product.images?.[0] ?? "";
  const img1 = product.images?.[1] ?? img0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isSaved) showToast(`Saved "${product.name}" to wishlist.`, "heart");
    else showToast(`Removed "${product.name}" from wishlist.`, "info");
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      id={`prod-card-${productId}`}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-stone-100"
      style={{ transition: "box-shadow 0.3s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span className="bg-amber-500 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            -{discount}%
          </span>
        )}
        {product.isTopSelling && (
          <span className="bg-stone-900 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Bestseller
          </span>
        )}
        {(product.stock ?? 1) <= 3 && (product.stock ?? 1) > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Only {product.stock} left
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-stone-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-full shadow transition-all duration-200 ${
          isSaved
            ? "bg-rose-500 text-white"
            : "bg-white/85 text-stone-500 hover:bg-white hover:text-stone-900"
        }`}
        title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
      </button>

      {/* Image — fixed 1:1 aspect ratio prevents any layout shift */}
      <Link
        to={`/product/${productId}`}
        className="block relative overflow-hidden bg-stone-50 flex-shrink-0"
        style={{ aspectRatio: "1 / 1" }}
      >
        {img0 ? (
          <img
            src={hovered && img1 ? img1 : img0}
            alt={product.name ?? "Product"}
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Image"; }}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <ShoppingBag className="w-10 h-10 text-stone-300" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/25 flex items-center justify-center">
            <span className="text-[10px] font-bold py-1 px-3 bg-stone-900 text-white rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        {/* Desktop hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex gap-2 justify-center z-20">
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="bg-white/95 text-stone-900 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${
              isOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </Link>

      {/* Card body — flex-1 expands, flex-col keeps price pinned at bottom */}
      <div className="flex-1 flex flex-col p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">
            {product.brand ?? ""}
          </span>
          <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">
            {product.soldCount ?? 0} sold
          </span>
        </div>

        {/* Title — 2-line clamp + min-height keeps all cards in the same row aligned */}
        <Link to={`/product/${productId}`} className="hover:text-amber-600 transition-colors">
          <h3
            className="font-sans font-semibold text-sm text-stone-900 leading-snug line-clamp-2"
            style={{ minHeight: "2.5rem" }}
          >
            {product.name ?? ""}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-1.5 mb-2">
          <Rating value={product.rating ?? 0} size={12} showText />
          <span className="text-[10px] text-stone-400 truncate max-w-[7rem]">{product.category ?? ""}</span>
        </div>

        {/* Price — mt-auto keeps it at the bottom regardless of title length */}
        <div className="mt-auto pt-2.5 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-stone-900 font-mono">${discountPrice.toFixed(2)}</span>
            {discount > 0 && (
              <span className="text-xs text-stone-400 line-through font-mono">${price.toFixed(2)}</span>
            )}
          </div>
          <span className="text-[10px] text-stone-400 font-mono truncate max-w-[6rem]">{product.color ?? ""}</span>
        </div>

        {/* Mobile buttons */}
        <div className="mt-2.5 flex gap-1.5 md:hidden">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider transition-colors ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800 active:scale-95"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add To Bag
          </button>
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="px-2.5 rounded-lg border border-stone-200 text-stone-600 flex items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors active:scale-95"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
