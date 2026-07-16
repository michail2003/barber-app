import { useState, useEffect } from "react";
import { GetShopStats } from "../../Api/Shop_Statistics";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, LineChart, Legend } from 'recharts';

// Indigo palette (income)
const incomeColors = ['#c7d2fe', '#3730a3', '#4338ca', '#818cf8', '#6366f1'];
const reservationColors = ["#FFFFFF", "#FF5555", "#F1C40F", "#2ECC71", "#E67E22"];
const highContrastColors = ["#FFFFFF", "#FF5555", "#F1C40F", "#2ECC71", "#E67E22"];

const ToggleBtn = ({ active, onClick, children, metric }) => {
    const activeClass = metric === 'reservations'
        ? 'bg-indigo-950 text-white shadow-sm border-1 border-white cursor-pointer'
        : 'bg-indigo-600 text-white shadow-sm cursor-pointer';
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${active ? activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer'
                }`}
        >
            {children}
        </button>
    );
};

const ShopStats = () => {
    const [showComparison, setShowComparison] = useState(false);
    const [filter, setFilter] = useState("Monthly");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [pieMetric, setPieMetric] = useState("income");
    const [barMetric, setBarMetric] = useState("income");

    const [apiResponse, setApiResponse] = useState(null);
    const [shop_busy_hours, setShop_busy_hours] = useState([]);
    const [barbers, setBarbers] = useState([]);

    function groupingData() {
        const shop_busy_hours = Object.entries(apiResponse.busyHours).map(([hour, count]) => ({
            hour,
            count,
        }));
        const barbers = Object.values(apiResponse.barberStats);

        setShop_busy_hours(shop_busy_hours);
        setBarbers(barbers);
    }

    const pieColors = pieMetric === 'income' ? incomeColors : reservationColors;
    const barColor = barMetric === 'income' ? '#6366f1' : '#DCDCDC';

    const renderPieLabel = ({ name, cx, cy, midAngle, outerRadius, index, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text
                x={x} y={y}
                fill={pieColors[index] || '#888'}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = barMetric === 'income'
                ? `${payload[0].value.toLocaleString()} L`
                : `${payload[0].value} reservations`;
            return (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow text-xs font-bold text-gray-800">
                    {label}: {val}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const val = pieMetric === 'income'
                ? `${payload[0].value.toLocaleString()} L`
                : `${payload[0].value} reservations`;
            return (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow text-xs font-bold text-gray-800">
                    {payload[0].name}: {val}
                </div>
            );
        }
        return null;
    };

    async function fetchShopStats() {
        const shopId = localStorage.getItem('shop');
        const data = await GetShopStats(shopId, filter.toLowerCase());
        setApiResponse(data);
    }

    useEffect(() => {
        fetchShopStats();
    }, [filter]);

    useEffect(() => {
        if (apiResponse && !apiResponse.message) {
            return groupingData();
        }
        if (apiResponse?.message) {
            setBarbers([])
            setShop_busy_hours([])
        }

    }, [apiResponse]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">

            {/* Period Filter */}
            <div className="flex justify-end mb-6 relative">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="bg-white border border-gray-200 px-6 py-2 rounded-xl shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    {filter} <span className="text-[10px]">▼</span>
                </button>
                {isFilterOpen && (
                    <div className="absolute right-0 mt-12 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                        {["Daily", "Weekly", "Monthly", "Yearly"].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { setFilter(opt); setIsFilterOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-b last:border-0 border-gray-50"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Reservations</p>
                    <h3 className="text-xl md:text-3xl font-black text-indigo-700">{apiResponse?.general_data?.totalReservations?.toLocaleString() ?? 0}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Income</p>
                    <h3 className="text-xl md:text-3xl font-black text-indigo-700">{apiResponse?.general_data?.totalIncome?.toLocaleString() ?? 0} LEK</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Peak Time</p>
                    <h3 className="text-2xl md:text-3xl font-black text-indigo-700">{apiResponse?.general_data?.peakHourData || "-"}</h3>
                </div>
                <div className="bg-indigo-700 p-5 rounded-2xl shadow-lg">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase">Lead</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{apiResponse?.general_data?.topBarber?.name || "-"}</h3>
                </div>
            </div>

            {/* Top Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Pie Chart */}
                <div className={`p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col ${pieMetric === 'reservations' ? 'bg-indigo-950' : 'bg-white'} transition-colors duration-500`}>
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <h2 className={`font-bold text-gray-800 text-xl`}>Barber Split {pieMetric === 'reservations' ? 'Reservations' : 'Income'}</h2>
                        <div className="flex gap-2">
                            <ToggleBtn
                                active={pieMetric === 'income'}
                                metric="income"
                                onClick={() => setPieMetric('income')}
                            >
                                Income
                            </ToggleBtn>
                            <ToggleBtn
                                active={pieMetric === 'reservations'}
                                metric="reservations"
                                onClick={() => setPieMetric('reservations')}
                            >
                                Reservations
                            </ToggleBtn>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                        <div className="w-full md:flex-1" style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={barbers}
                                        dataKey={pieMetric === 'income' ? 'total_price' : 'reservations'}
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="80%"
                                        stroke="none"
                                        label={renderPieLabel}

                                    >
                                        {barbers.map((entry, index) => (
                                            <Cell key={index} fill={pieColors[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="md:flex flex-row flex-wrap md:flex-col gap-x-4 gap-y-2 md:gap-3 justify-center md:justify-start hidden">
                            {barbers.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-[13px]">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[index] }} />
                                    <span className="font-bold uppercase text-[11px]" style={{ color: pieColors[index] }}>{entry.name}:</span>
                                    <span className={`text-xs font-black hidden md:inline ${pieMetric === 'reservations' ? 'text-white' : 'text-gray-800'}`}>
                                        {pieMetric === 'income' ? `${entry.total_price.toLocaleString()} L` : `${entry.reservations} res`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile values */}
                    <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 mt-2 md:hidden">
                        {barbers.map((entry, index) => (
                            <span key={index} className={`text-xs font-black ${pieMetric === 'reservations' ? 'text-white' : 'text-gray-700'}`}>
                                <span style={{ color: pieColors[index] }}>{entry.name}</span>:{' '}
                                {pieMetric === 'income' ? `${entry.total_price.toLocaleString()} L` : `${entry.reservations} res`}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className={`p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 ${barMetric === 'reservations' ? 'bg-indigo-950' : 'bg-white'} transition-colors duration-500`}>
                    <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
                        <h2 className={`font-bold ${barMetric === 'reservations' ? 'text-white' : 'text-gray-800'} text-xl`}>Revenue Trend</h2>
                        <div className="flex gap-2">
                            <ToggleBtn
                                active={barMetric === 'income'}
                                metric="income"
                                onClick={() => setBarMetric('income')}
                            >
                                Income
                            </ToggleBtn>
                            <ToggleBtn
                                active={barMetric === 'reservations'}
                                metric="reservations"
                                onClick={() => setBarMetric('reservations')}
                            >
                                Reservations
                            </ToggleBtn>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={apiResponse?.periodStats}
                                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" horizontal={false} />
                                <XAxis
                                    dataKey="period"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600, fill: barMetric === 'reservations' ? '#c7d2fe' : '#4338ca' }}
                                    interval={0}
                                />
                                <YAxis hide={true} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "none", }} />
                                <Bar dataKey={barMetric} fill={barColor} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Full Width Line Chart */}
            <div className={`relative transition-all duration-500 rounded-3xl p-4 md:p-8 shadow-xl ${showComparison ? 'bg-indigo-950' : 'bg-white border border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10 relative z-10">
                    <h2 className={`text-xl md:text-2xl font-black ${showComparison ? 'text-white' : 'text-gray-800'}`}>
                        {showComparison ? 'Comparative Performance' : 'Daily Traffic Pattern'}
                    </h2>
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`w-full sm:w-auto px-6 md:px-8 py-3 rounded-xl font-black transition-all text-xs md:text-sm uppercase tracking-wider ${showComparison ? 'bg-white text-indigo-900 shadow-lg' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {showComparison ? 'Simple View' : 'Compare Team'}
                    </button>
                </div>

                <div style={{ width: '100%', height: 300 }} className="md:h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {showComparison ? (
                            // Comparison view disabled: needs per-barber busy-hour data from the API
                            // (busyHoursData), which isn't implemented yet. Falling back to the
                            // simple Daily Traffic Pattern chart so nothing breaks.
                            <LineChart data={shop_busy_hours} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 11 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis hide={true} />
                                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#4338ca"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#4338ca', strokeWidth: 3, stroke: '#fff' }}
                                />
                            </LineChart>
                            // <LineChart data={busyHoursData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                            //     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            //     <XAxis
                            //         dataKey="hour"
                            //         stroke="#c7d2fe"
                            //         axisLine={false}
                            //         tickLine={false}
                            //         tick={{ fontSize: 10 }}
                            //         interval="preserveStartEnd"
                            //     />
                            //     <YAxis hide={true} />
                            //     <Tooltip
                            //         contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '12px', border: 'none', fontSize: 12 }}
                            //     />
                            //     <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                            //     {stats[0].barbers.map((b, i) => (
                            //         <Line
                            //             key={i}
                            //             type="monotone"
                            //             dataKey={b.name}
                            //             stroke={highContrastColors[i]}
                            //             strokeWidth={3}
                            //             dot={{ r: 3 }}
                            //         />
                            //     ))}
                            // </LineChart>
                        ) : (
                            <LineChart data={shop_busy_hours} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 11 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis hide={true} />
                                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#4338ca"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#4338ca', strokeWidth: 3, stroke: '#fff' }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ShopStats;