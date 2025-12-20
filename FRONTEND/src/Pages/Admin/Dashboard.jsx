import { useState } from "react";
import { addShop } from "../../Api/Shops";

const Dashboard = () => {
    const [formData, setFormData] = useState({
        nipt: "",
        name: "",
        address: "",
        phone: "",
        opening_hours: "",
        logo_url: "",
    });

    async function handleSubmit() {
        console.log(formData);
        await addShop({
            nipt: formData.nipt,
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            opening_hours: formData.opening_hours,
            logo_url: formData.logo_url
        });
        alert("Shop registered successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Header Header */}
                <div className="bg-gray-900 py-8 px-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Register Your Shop</h2>
                    <p className="text-gray-400 mt-2">Enter your business details to get started</p>
                </div>

                <div className="p-10 space-y-6">
                    
                    {/* Legal / Identification Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">NIPT (Tax ID)</label>
                            <input
                                type="text"
                                name="nipt"
                                value={formData.nipt}
                                onChange={(e) => setFormData({ ...formData, nipt: e.target.value })}
                                placeholder="J00000000X"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value})}
                                placeholder="Classic Cuts Studio"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value})}
                                placeholder="+355 6X XXX XXXX"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Hours</label>
                            <input
                                type="text"
                                name="opening_hours"
                                value={formData.opening_hours}
                                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value})}
                                placeholder="Mon-Sat 09:00 - 20:00"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Location Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Physical Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value})}
                            placeholder="Street name, Building number, City"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Branding Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value})}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all pl-10"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔗</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-200 transition-all transform active:scale-[0.98] uppercase tracking-wider"
                            onClick={handleSubmit}
                        >
                            Register Barber Shop
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Dashboard;