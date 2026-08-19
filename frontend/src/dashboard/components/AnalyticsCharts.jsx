import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 PieChart,
 Pie,
 Cell,
 AreaChart,
 Area,
 CartesianGrid,
} from "recharts";
import { useThemeContext } from "../../context/ThemeContext";

export default function AnalyticsCharts({ products, categories }) {
 const { theme } = useThemeContext();
 const isDark = theme === "dark";

 const byCategoryData = categories.map((cat) => {
 const count = products.filter((p) => p.category === cat.name).length;
 return { name: cat.name, count };
 });

 const featured = products.filter((p) => p.isFeatured).length;
 const standard = products.length - featured;
 const distributionData = [
 { name: "Featured", value: featured },
 { name: "Standard", value: standard },
 ];
 const COLORS = ["#d97706", "#292524"];

 const topSellingData = [...products]
 .sort((a, b) => b.soldCount - a.soldCount)
 .slice(0, 5)
 .map((p) => ({
 name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
 sold: p.soldCount,
 revenue: p.soldCount * p.price,
 }));

 const outOfStock = products.filter((p) => p.stock === 0).length;
 const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
 const healthyStock = products.filter((p) => p.stock > 10).length;
 const stockStatistics = [
 { name: "Out of Stock (0)", count: outOfStock, color: "#ef4444" },
 { name: "Low Stock (1-10)", count: lowStock, color: "#f59e0b" },
 { name: "Healthy (>10)", count: healthyStock, color: "#10b981" },
 ];

 const gridStroke = isDark ? "#44403c" : "#f5f5f4";
 const axisStroke = isDark ? "#78716c" : "#878684";
 const tooltipStyle = isDark
 ? { background: "#1c1917", border: "1px solid #44403c", borderRadius: "12px", fontSize: "11px", color: "#e7e5e4" }
 : { background: "#fcfaee", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "11px" };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-analytics-grid">
 {/* Chart 1: Products by Category */}
 <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-xs flex flex-col h-96">
 <h3 className="font-sans font-bold text-stone-900 text-sm tracking-tight mb-4">
 Products by Category
 </h3>
 <div className="w-full h-full min-h-0 flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={byCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
 <XAxis dataKey="name" stroke={axisStroke} fontSize={10} tickLine={false} />
 <YAxis stroke={axisStroke} fontSize={10} tickLine={false} />
 <Tooltip contentStyle={tooltipStyle} />
 <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} barSize={28} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Chart 2: Featured Products Distribution */}
 <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-xs flex flex-col h-96">
 <h3 className="font-sans font-bold text-stone-900 text-sm tracking-tight mb-4">
 Featured Distribution
 </h3>
 <div className="w-full h-full min-h-0 flex-1 flex flex-col sm:flex-row items-center justify-around gap-4">
 <div className="w-56 h-56 relative flex-shrink-0">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={distributionData}
 cx="50%"
 cy="50%"
 innerRadius={65}
 outerRadius={85}
 paddingAngle={4}
 dataKey="value"
 >
 {distributionData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={tooltipStyle} />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="font-sans font-extrabold text-stone-900 text-2xl">
 {products.length}
 </span>
 <span className="text-stone-400 text-[10px] tracking-wider uppercase font-mono">
 Total SKUs
 </span>
 </div>
 </div>
 <div className="flex flex-col gap-3 justify-center">
 {distributionData.map((item, index) => (
 <div key={item.name} className="flex items-center gap-2 text-xs">
 <span
 className="w-3.5 h-3.5 rounded-md flex-shrink-0"
 style={{ backgroundColor: COLORS[index] }}
 />
 <span className="text-stone-600 font-medium">
 {item.name}: <strong className="text-stone-900">{item.value}</strong> (
 {products.length ? Math.round((item.value / products.length) * 100) : 0}%)
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Chart 3: Top Selling Products */}
 <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-xs flex flex-col h-96">
 <h3 className="font-sans font-bold text-stone-900 text-sm tracking-tight mb-4">
 Top Selling Bags Performance
 </h3>
 <div className="w-full h-full min-h-0 flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={topSellingData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
 <defs>
 <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
 <XAxis dataKey="name" stroke={axisStroke} fontSize={9} tickLine={false} />
 <YAxis stroke={axisStroke} fontSize={10} tickLine={false} />
 <Tooltip contentStyle={tooltipStyle} />
 <Area
 type="monotone"
 dataKey="sold"
 name="Quantity Sold"
 stroke="#d97706"
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorSold)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Chart 4: Product Stock Statistics */}
 <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-xs flex flex-col h-96">
 <h3 className="font-sans font-bold text-stone-900 text-sm tracking-tight mb-4">
 Stock Quality Levels
 </h3>
 <div className="w-full h-full min-h-0 flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 layout="vertical"
 data={stockStatistics}
 margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
 <XAxis type="number" stroke={axisStroke} fontSize={10} tickLine={false} />
 <YAxis dataKey="name" type="category" stroke={axisStroke} fontSize={9} width={90} tickLine={false} />
 <Tooltip contentStyle={tooltipStyle} />
 <Bar dataKey="count" name="Products Count" radius={[0, 4, 4, 0]} barSize={20}>
 {stockStatistics.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
}
