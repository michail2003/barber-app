import { useState } from "react";
import { addShop } from "../../Api/Shops";
const Dashboard = () => {
    const [formData, setFormData] = useState({
        nipt: "",
        name: "", // array of IDs, can be enhanced later with multi-select
        address: "",
        phone: "",
        opening_hours: "",
        logo_url: "",
    });




    async function handleSubmit (){
        console.log(formData);
        await addShop({
            nipt: formData.nipt,
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            opening_hours: formData.opening_hours,
            logo_url: formData.logo_url
        });
        
    };
    return (
        <div className="max-w-md mx-auto p-4 border rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Add New Barber Shop</h2>
            <div className="space-y-3">
                <input
                    type="text"
                    name="nipt"
                    value={formData.nipt}
                    onChange={(e) => setFormData({ ...formData, nipt: e.target.value })}
                    placeholder="NIPT"
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value})}
                    placeholder="Business Name"
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value})}
                    placeholder="Address"
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value})}
                    placeholder="Phone Number"
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value})}
                    placeholder="Opening Hours"
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value})}
                    placeholder="Logo URL"
                    className="w-full border p-2 rounded"
                />

                <button
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    onClick={handleSubmit}
                > submit
                </button>
            </div>
        </div>
    )
}

export default Dashboard