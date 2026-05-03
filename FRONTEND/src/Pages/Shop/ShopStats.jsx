import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, LineChart, Legend } from 'recharts';

// Indigo palette (income)
const incomeColors = ['#c7d2fe', '#3730a3', '#4338ca', '#818cf8', '#6366f1'];

// Orange palette (reservations)
const reservationColors = ['#fed7aa', '#c2410c', '#ea580c', '#fb923c', '#f97316'];

const ToggleBtn = ({ active, onClick, children, metric }) => {
    const activeClass = metric === 'reservations'
        ? 'bg-orange-500 text-white shadow-sm'
        : 'bg-indigo-600 text-white shadow-sm';
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                active ? activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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

    const shop_income_data = [
        { name: "Jan", income: 95000, reservations: 78 },
        { name: "Feb", income: 85000, reservations: 65 },
        { name: "Mar", income: 110000, reservations: 92 },
        { name: "Apr", income: 105000, reservations: 88 },
        { name: "May", income: 120000, reservations: 101 },
        { name: "Jun", income: 135000, reservations: 115 },
        { name: "Jul", income: 140000, reservations: 120 },
        { name: "Aug", income: 125000, reservations: 108 },
        { name: "Sep", income: 138000, reservations: 117 },
        { name: "Oct", income: 142000, reservations: 122 },
        { name: "Nov", income: 148000, reservations: 130 },
        { name: "Dec", income: 185000, reservations: 158 },
    ];

    const stats = [{
        income: 100000,
        reservations: 124,
        barbers: [
            { name: 'Alex',   income: 20000, reservations: 18, busyHours: [{ hour: '09:00', bookings: 4 }, { hour: '11:00', bookings: 12 }, { hour: '14:00', bookings: 25 }] },
            { name: 'Marco',  income: 20000, reservations: 22, busyHours: [{ hour: '10:00', bookings: 20 }, { hour: '11:00', bookings: 30 }, { hour: '14:00', bookings: 25 }] },
            { name: 'Niko',   income: 50000, reservations: 45, busyHours: [{ hour: '12:00', bookings: 20 }, { hour: '14:00', bookings: 22 }] },
            { name: 'Klajdi', income: 25000, reservations: 20, busyHours: [{ hour: '09:00', bookings: 3 }, { hour: '14:00', bookings: 15 }] },
            { name: 'Matteo', income: 25000, reservations: 19, busyHours: [{ hour: '11:00', bookings: 13 }, { hour: '14:00', bookings: 20 }] },
        ],
        busyHours: [
            { hour: '09:00', bookings: 4 }, { hour: '10:00', bookings: 8 }, { hour: '11:00', bookings: 12 },
            { hour: '12:00', bookings: 15 }, { hour: '13:00', bookings: 10 }, { hour: '14:00', bookings: 25 },
            { hour: '15:00', bookings: 10 }, { hour: '16:00', bookings: 2 }, { hour: '19:00', bookings: 5 }
        ]
    }];

    const highContrastColors = ["#FFFFFF", "#FF5555", "#F1C40F", "#2ECC71", "#E67E22"];

    const busyHoursData = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(hour => {
        let obj = { hour };
        stats[0].barbers.forEach(b => {
            const match = b.busyHours.find(bh => bh.hour === hour);
            obj[b.name] = match ? match.bookings : 0;
        });
        return obj;
    });

    const pieColors = pieMetric === 'income' ? incomeColors : reservationColors;
    const barColor = barMetric === 'income' ? '#6366f1' : '#ea580c';

    const renderPieLabel = ({ name, cx, cy, midAngle, outerRadius, index }) => {
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
                fontSize={11}
                fontWeight={600}
            >
                {name}
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
                    <h3 className="text-2xl md:text-3xl font-black text-indigo-700">{stats[0].reservations}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Income</p>
                    <h3 className="text-xl md:text-3xl font-black text-indigo-700">{stats[0].income.toLocaleString()} L</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Peak Time</p>
                    <h3 className="text-2xl md:text-3xl font-black text-indigo-700">14:00</h3>
                </div>
                <div className="bg-indigo-700 p-5 rounded-2xl shadow-lg">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase">Lead</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">Niko</h3>
                </div>
            </div>

            {/* Top Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Pie Chart */}
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <h2 className="font-bold text-gray-800 text-xl">Barber Split</h2>
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
                                        data={stats[0].barbers}
                                        dataKey={pieMetric}
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="38%"
                                        stroke="none"
                                        label={renderPieLabel}
                                        labelLine={false}
                                    >
                                        {stats[0].barbers.map((entry, index) => (
                                            <Cell key={index} fill={pieColors[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-row flex-wrap md:flex-col gap-x-4 gap-y-2 md:gap-3 justify-center md:justify-start">
                            {stats[0].barbers.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-[13px]">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[index] }} />
                                    <span className="font-bold uppercase text-[11px]" style={{ color: pieColors[index] }}>{entry.name}</span>
                                    <span className="text-xs font-black text-gray-800 hidden md:inline">
                                        {pieMetric === 'income' ? `${entry.income.toLocaleString()} L` : `${entry.reservations} res`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile values */}
                    <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 mt-2 md:hidden">
                        {stats[0].barbers.map((entry, index) => (
                            <span key={index} className="text-xs font-black text-gray-700">
                                <span style={{ color: pieColors[index] }}>{entry.name}</span>:{' '}
                                {pieMetric === 'income' ? `${entry.income.toLocaleString()} L` : `${entry.reservations} res`}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
                        <h2 className="font-bold text-gray-800 text-xl">Revenue Trend</h2>
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
                                data={shop_income_data}
                                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600 }}
                                    interval={0}
                                />
                                <YAxis hide={true} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
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
                            <LineChart data={busyHoursData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#c7d2fe"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis hide={true} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '12px', border: 'none', fontSize: 12 }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                                {stats[0].barbers.map((b, i) => (
                                    <Line
                                        key={i}
                                        type="monotone"
                                        dataKey={b.name}
                                        stroke={highContrastColors[i]}
                                        strokeWidth={3}
                                        dot={{ r: 3 }}
                                    />
                                ))}
                            </LineChart>
                        ) : (
                            <LineChart data={stats[0].busyHours} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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
                                    dataKey="bookings"
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