import { useState, useEffect } from 'react'
import { add_barber } from '../../Api/Barber';
import { getShop } from '../../Api/Shops';

const Barber = () => {
    const [formData, setFormData] = useState({
        shopId: "",
        name: "",
        phone: "",
        hours: "",
        services: [],
        email: "",
        password: "",
        role: ""
    });
    const [newService, setNewService] = useState({ name: '', price: 0, duration: 0 });

    const slug = location.pathname.split('/')[1];
    
    const getShopId = async () => {
        const shop = await getShop(slug);
        const id = shop._id;
        setFormData((prevData) => ({ ...prevData, shopId: id }));
    }

    async function handleSubmit() {
        try {
            await add_barber({
                name: formData.name,
                ph_number: formData.phone,
                hours: formData.hours,
                shopId: formData.shopId,
                services: formData.services,
                role: formData.role,
                email: formData.email,
                password: formData.password
            });
            alert("Barber added successfully!");
        } catch (error) {
            console.error('Error adding barber:', error);
        }
    }

    useEffect(() => {
        getShopId();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Header */}
                <div className="bg-gray-900 py-8 px-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Add New Barber</h2>
                    <p className="text-gray-400 mt-2">Register a professional to your shop</p>
                </div>

                <div className="p-10 space-y-8">
                    
                    {/* Account Section */}
                    <section>
                        <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="barber@example.com"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
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
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+355 69..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
                            <input
                                type="text"
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                placeholder="e.g. Mon-Fri 09:00 - 21:00"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Assign Permissions</label>
                            <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="role"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500"
                                        onClick={() => setFormData({ ...formData, role: "barber_admin" })}
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Shop Admin</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="role"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500"
                                        onClick={() => setFormData({ ...formData, role: "barber" })}
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Standard Barber</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="bg-amber-100 text-amber-700 p-1.5 rounded-md mr-2">✂️</span>
                            Offered Services
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Service (e.g. Fade)"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Price (€)"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Min"
                                value={newService.duration}
                                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!newService.name) return;
                                setFormData((prev) => ({ ...prev, services: [...prev.services, { ...newService }] }));
                                setNewService({ name: '', price: 0, duration: 0 });
                            }}
                            className="w-full bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all text-sm mb-6 border border-gray-200"
                        >
                            + Add to Price List
                        </button>

                        <div className="space-y-3">
                            {formData.services && formData.services.length > 0 ? (
                                formData.services.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-800">{s.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{s.price} Leke • {s.duration} Minutes</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }))}
                                            className="text-red-400 hover:text-red-600 text-xs font-bold uppercase"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-400 italic py-4">No services defined yet.</p>
                            )}
                        </div>
                    </section>

                    {/* Submit Button */}
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