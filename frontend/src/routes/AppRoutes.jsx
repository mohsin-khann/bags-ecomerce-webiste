import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";

const Home = lazy(() => import("../pages/Home"));
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const NotFound = lazy(() => import("../pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />

              <Route path="cart" element={<Cart />} />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="wishlist" element={<Wishlist />} />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="admin/login" element={<Navigate to="/login" replace />} />

            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ErrorBoundary context="dashboard">
                    <AdminDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
