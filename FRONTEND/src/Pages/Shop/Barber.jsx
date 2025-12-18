import { useState, useEffect, use } from 'react'
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
        const shop = await getShop(slug); // wait for the API
        const id = shop._id;
        setFormData((prevData) => ({ ...prevData, shopId: id }));
    }

    async function handleSubmit() {
        console.log(formData)
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

        } catch (error) {
            console.error('Error adding barber:', error);
        }
    }
    useEffect(() => {
        getShopId();
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Add Barber</h2>
                {/* {email} */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    />
                </div>
                {/* password */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="password">password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="password"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    />
                </div>
                {/* Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                    <input type="text" name="name" id="name"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Barber name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required />
                </div>
                {/* Phone */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+355 69xxxxxxx"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    />
                </div>

                {/* Hours */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="hours">Working Hours</label>
                    <input
                        type="text"
                        name="hours"
                        id="hours"
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        placeholder="10:00 - 20:00"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    />
                </div>

                {/* Role */}
                <div className="flex gap-4">
                    {/* Admin */}
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="role"
                            required
                            onClick={() => setFormData({ ...formData, role: "barber_admin" })}
                        />
                        <span>Admin Barber</span>
                    </label>

                    {/* Barber */}
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="role"
                            required
                            onClick={() => setFormData({ ...formData, role: "barber" })}
                        />
                        <span>Barber</span>
                    </label>
                </div>

                {/* Services input */}

                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Services</h3>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Service name"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="number"
                            placeholder="Duration (e.g. 30m)"
                            value={newService.duration}
                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (!newService.name) return;
                                setFormData((prev) => ({ ...prev, services: [...prev.services, { ...newService, price: newService.price }] }));
                                setNewService({ name: '', price: 0, duration: 0 });
                            }}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            Add Service
                        </button>
                    </div>

                    {/* List of added services */}
                    <div className="space-y-2">
                        {formData.services && formData.services.length > 0 ? (
                            formData.services.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between border px-3 py-2 rounded-lg">
                                    <div>
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-sm text-gray-600">Price: {s.price} | Duration: {s.duration}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }))}
                                        className="text-red-500 hover:underline"
                                    >Remove</button>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">No services added yet.</div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors">
                    Add Barber
                </button>
            </div>
        </div>
    )
}

export default Barber