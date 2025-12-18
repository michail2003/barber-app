import React, { useEffect, useState } from 'react';
import { getShops,addShop,getShop } from '../Api/Shops';
import Calendar from '../components/Calendar';
import { Link } from 'react-router-dom';
const Home = () => {
  const [shops, setShops] = useState([]);

  const fetchShops = async () => {
    try {
      const data = await getShops();
      setShops(data);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (

    <div>
      <Calendar />
      <button className="m-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        <Link to="/admin/dashboard">
          add shop
        </Link>

      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {shops.map((shop, idx) => (
          <Link to={`/${shop.slug}`} key={idx}>
          <div key={idx} className="max-w-sm w-full bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition">
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="w-full h-40 object-cover rounded-xl"
            />

            <div className="mt-4">
              <h2 className="text-xl font-bold">{shop.name}</h2>
              <p className="text-gray-600 text-sm">{shop.address}</p>

              <div className="mt-2">
                <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                  {shop.opening_hours}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-700 font-medium">{shop.phone}</p>

                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
                  View
                </button>
                
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default Home;