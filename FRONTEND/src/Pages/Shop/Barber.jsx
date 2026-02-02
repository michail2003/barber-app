import { useState, useEffect } from 'react'
import { add_barber } from '../../Api/Barber';
import { getShop, getcatalog } from '../../Api/Shops';
import { useLocation } from 'react-router-dom';

const Barber = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        shopId: "",
        name: "",
        phone: "",
        startHour: "",
        endHour: "",
        services: [],
        email: "",
        password: "",
        role: ""
    });
    const [catalog, setCatalog] = useState([]);

    const slug = location.pathname.split('/')[1];

    const getShopId = async () => {
        try {
            const shop = await getShop(slug);
            const id = shop._id;
            setFormData((prevData) => ({ ...prevData, shopId: id }));
        } catch (error) {
            console.error('Error fetching shop ID:', error);
        }
    }

    // FIXED: Ensure we use the correct ID reference
    function updateServiceDuration(serviceId, newDuration) {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.map((s) =>
                s.service === serviceId ? { ...s, duration: newDuration } : s
            ),
        }));
    }

    async function handleSubmit() {
        try {
            await add_barber({
                name: formData.name,
                ph_number: formData.phone,
                shopId: formData.shopId,
                services: formData.services,
                role: formData.role,
                email: formData.email,
                password: formData.password,
                hours_start: formData.startHour,
                hours_end: formData.endHour
            });
            alert("Barber added successfully!");
        } catch (error) {
            console.error('Error adding barber:', error);
        }
    }

    async function fetchServices() {
        try {
            const services = await getcatalog(formData.shopId);
            setCatalog(services);

            // Set default duration to 30 so the "-" button has something to subtract from
            const defaultServices = services.map(item => ({
                service: item._id,
                duration: 0,
            }));
            setFormData(prev => ({ ...prev, services: defaultServices }));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }

    useEffect(() => {
        getShopId();
    }, []);

    useEffect(() => {
        if (formData.shopId) {
            fetchServices();
        }
    }, [formData.shopId]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-900 py-8 px-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Add New Barber</h2>
                    <p className="text-gray-400 mt-2">Register a professional to your shop</p>
                </div>

                <div className="p-10 space-y-8">
                    {/* Credentials Section */}
                    <section>
                        <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Profile Section */}
                    <section>
                        <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Barber Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Working Hours</label>
                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Starts at</span>
                                    <input
                                        type="time"
                                        value={formData.startHour}
                                        onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                                        className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
                                    />
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Ends at</span>
                                    <input
                                        type="time"
                                        value={formData.endHour}
                                        onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                                        className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Assign Permissions / Role Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Assign Permissions</label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="role"
                                    checked={formData.role === "barber_admin"}
                                    onChange={() => setFormData({ ...formData, role: "barber_admin" })}
                                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Shop Admin</span>
                            </label>
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="role"
                                    checked={formData.role === "barber"}
                                    onChange={() => setFormData({ ...formData, role: "barber" })}
                                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Standard Barber</span>
                            </label>
                        </div>
                    </div>
                    {/* Services Section */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-amber-100 text-amber-700 p-1.5 rounded-md mr-2">✂️</span>
                            Service Menu & Durations
                        </h3>

                        <div className="space-y-4">
                            {catalog.map((item) => {
                                const currentService = formData.services.find(s => s.service === item._id);
                                const isSelected = !!currentService;

                                return (
                                    <div
                                        key={item._id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            services: prev.services.filter(s => s.service !== item._id)
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            services: [...prev.services, {
                                                                service: item._id,
                                                                duration: 0,
                                                            }]
                                                        }));
                                                    }
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSelected ? 'bg-amber-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSelected ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>

                                            <div>
                                                <p className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{item.service}</p>
                                                <p className="text-xs text-gray-400">{item.price} Leke</p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-white border border-amber-200 rounded-lg overflow-hidden shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateServiceDuration(item._id, Math.max(5, currentService.duration - 5))}
                                                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold"
                                                    >–</button>
                                                    <input
                                                        type="number"
                                                        readOnly
                                                        value={currentService.duration}
                                                        className="w-10 text-center text-sm font-bold text-gray-800 focus:outline-none bg-transparent"
                                                    />
                                                    <span className="pr-2 text-[10px] font-bold text-gray-400">MIN</span>
                                                    <button
                                                        type="button"

                                                        onClick={() => updateServiceDuration(item._id, currentService.duration + 5)}
                                                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold"
                                                    >+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-200 transition-all transform active:scale-[0.98]"
                    >
                        Create Barber Account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Barber;