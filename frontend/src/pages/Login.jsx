import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
 const { login } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");

 const validate = () => {
 let isValid = true;
 setEmailError("");
 setPasswordError("");

 if (!email.trim()) {
 setEmailError("Email address is required");
 isValid = false;
 } else if (!/\S+@\S+\.\S+/.test(email)) {
 setEmailError("Please enter a valid email address");
 isValid = false;
 }

 if (!password) {
 setPasswordError("Password is required");
 isValid = false;
 } else if (password.length < 6) {
 setPasswordError("Password must be at least 6 characters long");
 isValid = false;
 }

 return isValid;
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!validate()) return;

 setIsSubmitting(true);
 try {
 const success = await login(email, password);
 if (success) {
 const storedUserStr = localStorage.getItem("msac_user");
 let role = "customer";
 let fullName = "Guest";
 if (storedUserStr) {
 try {
 const parsed = JSON.parse(storedUserStr);
 role = parsed.role;
 fullName = parsed.fullName;
 } catch (_) {}
 }

 if (role === "admin") {
 showToast(`Access Authorized. Welcome back, ${fullName}.`, "success");
 navigate("/admin/dashboard");
 } else {
 showToast(`Welcome back, ${fullName}! Successfully logged in.`, "success");
 navigate("/");
 }
 } else {
 showToast("Invalid credentials. Please verify and try again.", "info");
 setPasswordError("Incorrect email or password.");
 }
 } catch (err) {
 console.error(err);
 showToast("Authentication server unavailable. Please try again shortly.", "info");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative select-none">
 <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
 <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

 <div className="absolute top-6 left-6 z-20">
 <Link
 to="/"
 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#8c6d3f] hover:text-[#5e492b] uppercase transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to Home
 </Link>
 </div>

 <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl shadow-xl p-8 relative z-10 transition-colors">
 <div className="flex flex-col items-center text-center mb-8">
 <Link to="/" className="flex items-baseline gap-1 group mb-4">
 <span className="font-sans font-extrabold text-2xl tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors">MAISON</span>
 <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">SAC</span>
 </Link>
 <h2 className="font-serif font-black text-stone-900 text-xl tracking-wide">WELCOME BACK</h2>
 <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] uppercase mt-1">
 Secure Member Login Portal
 </span>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">
 Email Address
 </label>
 <div className={`relative flex items-center rounded-xl border transition-all ${
 emailError
 ? "border-rose-500 bg-rose-50/10"
 : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"
 }`}>
 <Mail className="absolute left-3.5 w-4 h-4 text-stone-450" />
 <input
 type="email"
 placeholder="email@example.com"
 className="w-full pl-10 pr-4 py-3 text-xs bg-transparent text-stone-850 font-medium focus:outline-none placeholder-stone-400"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 disabled={isSubmitting}
 autoComplete="email"
 />
 </div>
 {emailError && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{emailError}</span>}
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">
 Password
 </label>
 <div className={`relative flex items-center rounded-xl border transition-all ${
 passwordError
 ? "border-rose-500 bg-rose-50/10"
 : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"
 }`}>
 <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
 <input
 type={showPassword ? "text" : "password"}
 placeholder="••••••••"
 className="w-full pl-10 pr-10 py-3 text-xs bg-transparent text-stone-850 font-mono focus:outline-none placeholder-stone-400"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 disabled={isSubmitting}
 autoComplete="current-password"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3.5 p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
 tabIndex={-1}
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {passwordError && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{passwordError}</span>}
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50"
 >
 {isSubmitting ? (
 <span className="w-4 h-4 border-2 border-stone-500 border-t-white animate-spin rounded-full" />
 ) : (
 <>
 SIGN IN
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>

 <div className="mt-6 text-center">
 <p className="text-xs text-stone-500">
 New to Maison de Sac?{" "}
 <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold underline transition-colors">
 Create Account
 </Link>
 </p>
 </div>

 <div className="mt-8 pt-4 border-t border-stone-150 text-center">
 <p className="text-[10px] text-stone-400 font-medium">
 Default admin: <code className="text-amber-655 font-bold font-mono">admin@maisonsac.com</code> / <code className="text-amber-655 font-bold font-mono">admin123</code>
 </p>
 </div>
 </div>
 </div>
 );
}
