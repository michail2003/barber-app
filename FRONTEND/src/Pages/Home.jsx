import React, { useEffect, useState } from 'react';
import { getShops } from '../Api/Shops';
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
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-gray-100 px-6 py-12 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Discover <span className="text-indigo-600">Premium</span> Shops
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Book your next appointment with the best professionals in town.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map((shop, idx) => (
            <Link to={`/${shop.slug}`} key={idx} className="group">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20">
                      {shop.opening_hours}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-2xl font-black text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                    {shop.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {shop.address}
                  </p>

                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Contact</p>
                      <p className="text-gray-700 font-bold">{shop.phone}</p>
                    </div>

                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;