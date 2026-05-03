import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Line, LineChart } from 'recharts'




const ShopStats = () => {
    const [stats, setStats] = useState([
        {
            income: 100000,
            reservations: 80,
            avgPrice: 40,
            barbers: [
                {
                    name: 'Alex', income: 20000, reservations: 128, color: '#c7d2fe',
                    busyHours: [
                        { hour: '09:00', bookings: 4 },
                        { hour: '10:00', bookings: 8 },
                        { hour: '11:00', bookings: 12 },
                        { hour: '12:00', bookings: 15 },
                        { hour: '13:00', bookings: 10 },
                        { hour: '14:00', bookings: 25 },
                        { hour: '15:00', bookings: 10 },
                    ]
                },
                {
                    name: 'Marco', income: 20000, reservations: 102, color: '#3730a3',
                    busyHours: [
                        { hour: '09:00', bookings: 15 },
                        { hour: '10:00', bookings: 20 },
                        { hour: '11:00', bookings: 30 },
                        { hour: '12:00', bookings: 15 },
                        { hour: '13:00', bookings: 10 },
                        { hour: '14:00', bookings: 25 },
                        { hour: '15:00', bookings: 8 },
                    ]
                },
                {
                    name: 'Niko', income: 50000, reservations: 70, color: '#4338ca',
                    busyHours: [
                        { hour: '09:00', bookings: 10 },
                        { hour: '10:00', bookings: 14 },
                        { hour: '11:00', bookings: 18 },
                        { hour: '12:00', bookings: 20 },
                        { hour: '13:00', bookings: 12 },
                        { hour: '14:00', bookings: 22 },
                        { hour: '15:00', bookings: 9 },
                    ]
                },
                {
                    name: 'Klajdi', income: 25000, reservations: 38, color: '#818cf8',
                    busyHours: [
                        { hour: '09:00', bookings: 3 },
                        { hour: '10:00', bookings: 6 },
                        { hour: '11:00', bookings: 9 },
                        { hour: '12:00', bookings: 11 },
                        { hour: '13:00', bookings: 7 },
                        { hour: '14:00', bookings: 15 },
                        { hour: '15:00', bookings: 5 },
                        { hour: '16:00', bookings: 2 },
                        { hour: '17:00', bookings: 1 },
                        { hour: '18:00', bookings: 1 },
                        { hour: '19:00', bookings: 5 },
                        { hour: '20:00', bookings: 0 },
                    ]
                },
                {
                    name: 'Matteo', income: 25000, reservations: 38, color: '#6366f1',
                    busyHours: [
                        { hour: '09:00', bookings: 5 },
                        { hour: '10:00', bookings: 9 },
                        { hour: '11:00', bookings: 13 },
                        { hour: '12:00', bookings: 17 },
                        { hour: '13:00', bookings: 8 },
                        { hour: '14:00', bookings: 20 },
                        { hour: '15:00', bookings: 7 },
                    ]
                },
            ],
            busyHours: [
                { hour: '09:00', bookings: 4 },
                { hour: '10:00', bookings: 8 },
                { hour: '11:00', bookings: 12 },
                { hour: '12:00', bookings: 15 },
                { hour: '13:00', bookings: 10 },
                { hour: '14:00', bookings: 25 },
                { hour: '15:00', bookings: 10 },
                { hour: '16:00', bookings: 2 },
                { hour: '17:00', bookings: 1 },
                { hour: '18:00', bookings: 1 },
                { hour: '19:00', bookings: 5 },
                { hour: '20:00', bookings: 0 },
            ],
            topClients: [
                { name: 'Nikos P.', visits: 18 }
            ],
            incomeYear: [
                { month: 'Jan', income: 8000 },
                { month: 'Feb', income: 12000 },
                { month: 'Mar', income: 15000 },
                { month: 'Apr', income: 20000 },
                { month: 'May', income: 25000 },
                { month: 'Jun', income: 30000 },
                { month: 'Jul', income: 35000 },
                { month: 'Aug', income: 40000 },
                { month: 'Sep', income: 45000 },
                { month: 'Oct', income: 50000 },
                { month: 'Nov', income: 55000 },
                { month: 'Dec', income: null },  // ← null instead of "no data"
            ]
        }
    ]);
    const [colorPalette, setColorPalette] = useState([
        '#c7d2fe',
        '#3730a3',
        '#4338ca',
        '#818cf8',
        '#6366f1',
    ])


    function hoursPrint(start, end) {

        let hourStart = parseInt(start.split(":")[0]);
        let hourEnd = parseInt(end.split(":")[0]);
        let Hours = [];

        for (let number = hourStart; number <= hourEnd; number++) {

            let formattedHour = String(number).padStart(2, '0');
            Hours.push(`${formattedHour}:00`);
        }
        return Hours;
    }

    const allHours = hoursPrint("09:00", "21:00");

    const busyHoursData = allHours.map(hour => {
        let hourObject = { hour: hour };

        stats[0].barbers.forEach(barber => {
            // Look for the specific hour in the barber's busyHours array
            const match = barber.busyHours.find(b => b.hour === hour);

            // Assign the bookings or 0 if they have no data for that slot
            hourObject[barber.name] = match ? match.bookings : 0;
        });

        return hourObject;
    });

    console.log("Final Table Data:", busyHoursData
        
    );

    return (

        <div className="w-full h-[100vh] bg-gray-200">
            <div className="flex gap-2 w-full md:flex-row flex-col items-center justify-center md:justify-start m-4">

                <div className="bg-[#ffff] rounded-lg flex flex-col w-1/2 items-baseline gap-2 p-4">

                    <div className="flex items-center gap-4 text-xl">
                        <h1 className="font-bold">Income Statistics:</h1>
                        <button className="italic text-m bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-xl cursor-pointer">monthly</button>
                    </div>

                    <div className="flex w-full items-center justify-center">
                        <ResponsiveContainer width="70%" height={300}>
                            <PieChart style={{ fontSize: '12px' }}>
                                <Pie
                                    data={stats[0].barbers}
                                    dataKey="income"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                >
                                    {stats[0].barbers.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        const barber = props.payload
                                        return [`${value} Lek`]
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex gap-2 w-fit flex-col p-2 items-start justify-center">
                            {stats[0].barbers.map((barber, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span
                                        style={{ backgroundColor: barber.color }}
                                        className="w-4 h-4 rounded-full inline-block"
                                    ></span>
                                    <span className="font-semibold">{barber.name}: <h1 className="inline font-bold">{barber.income.toLocaleString()}</h1> Lek</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 w-full md:w-1/2">
                    <h1 className="text-lg font-bold mb-2 text-center">Yearly Income</h1>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={stats[0].incomeYear}
                            margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#3730a3" opacity={0.2} />
                            <XAxis dataKey="month" stroke="#818cf8" tick={{ fill: '#818cf8', fontSize: 10 }} />
                            <YAxis stroke="#818cf8" tick={{ fill: '#818cf8', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()} L`} />
                            <Tooltip
                                contentStyle={{ background: '#1e1b4b', border: '1px solid #4338ca', borderRadius: 8 }}
                                labelStyle={{ color: '#c7d2fe' }}
                                itemStyle={{ color: '#818cf8' }}
                                formatter={(v) => [`${v.toLocaleString()} Lek`, 'Income']}
                            />
                            <Legend wrapperStyle={{ color: '#c7d2fe' }} />
                            <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>

            <div className="flex items-center justify-center w-full mt-4 p-4 bg-white rounded-lg">
                <div className="bg-white rounded-lg p-4 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={stats[0].busyHours}
                            margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#3730a3" opacity={0.2} />
                            <XAxis
                                dataKey="hour"
                                padding={{ left: 30, right: 30 }}
                                stroke="#818cf8"
                                tick={{ fill: '#818cf8', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ stroke: '#4338ca' }}
                                contentStyle={{ background: '#1e1b4b', border: '1px solid #4338ca', borderRadius: 8 }}
                                labelStyle={{ color: '#c7d2fe' }}
                                itemStyle={{ color: '#818cf8' }}
                                formatter={(v) => [`${v} bookings`, 'Bookings']}
                            />
                            <Legend wrapperStyle={{ color: '#c7d2fe' }} />
                            <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', stroke: '#c7d2fe', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 8, fill: '#818cf8', stroke: '#c7d2fe', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>


            <div className="bg-white rounded-xl p-4 w-full mt-4">
                <h1 className="font-bold text-xl mb-4">Busy Hours per Barber</h1>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={busyHoursData}
                        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#3730a3" opacity={0.2} />
                        <XAxis
                            dataKey={"hour"}
                            padding={{ left: 30, right: 30 }}
                            stroke="#818cf8"
                            tick={{ fill: '#818cf8', fontSize: 12 }}
                        />
                        <YAxis
                            stroke="#818cf8"
                            tick={{ fill: '#818cf8', fontSize: 12 }}
                            tickFormatter={(v) => `${v}`}
                        />
                        <Tooltip
                            cursor={{ stroke: '#4338ca' }}
                            contentStyle={{ background: '#1e1b4b', border: '1px solid #4338ca', borderRadius: 8 }}
                            labelStyle={{ color: '#c7d2fe' }}
                            itemStyle={{ color: '#818cf8' }}
                            formatter={(v, name) => [`${v} bookings`, name]}
                        />
                        <Legend wrapperStyle={{ color: '#c7d2fe' }} />
                        {stats[0].barbers.map((barber, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey={barber.name}
                                stroke={barber.color}
                                strokeWidth={2}
                                dot={{ fill: barber.color, stroke: '#1e1b4b', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 8, fill: barber.color, stroke: '#c7d2fe', strokeWidth: 2 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

    )
}

export default ShopStats