import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { shops_hartography } from '../Api/Maps';

// --- CUSTOM SVG MARKERS ---
// Indigo pin for Barber Shops
const shopIcon = L.divIcon({
  className: 'custom-pin',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shadow-lg transform transition-transform hover:scale-110">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Black pulse icon for User Location
const userIcon = L.divIcon({
  className: 'user-pin',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-slate-900 border-2 border-white shadow-md"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Helper component to center map when selecting a shop
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
};


function formatDistance(meters) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const BarberShopMap = () => {
  const [shops, setShops] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);

  function maps_redirection(lat, lng) {
    const link = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    return link
  }

  //getting shops from api
  async function shops_data_maps(lat, lng) {
    const data = await shops_hartography(lat, lng)
    setShops(data)
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        localStorage.setItem('location', [pos.coords.latitude, pos.coords.longitude])
        shops_data_maps(pos.coords.latitude, pos.coords.longitude)
      },

    );

  }, []);
  console.log(shops)

  // Filter and sort shops
  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => shop.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.distance - b.distance);
  }, [shops, searchQuery]);

  if (!userPos) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-gray-50 text-gray-500 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-sm">Locating nearby spots...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans antialiased">

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nearby Barber Shops</h1>
          <p className="text-sm text-slate-500">Discover and navigate to top-rated spots near you</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Grid: Responsive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">

        {/* Left Side: Scrollable Cards List */}
        <div className="lg:col-span-5 flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shops Found ({filteredShops.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {filteredShops.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No shops match your search.</div>
            ) : (
              filteredShops.map((shop, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedShop(shop)}
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${selectedShop?.name === shop.name
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-200 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm leading-snug">{shop.name}</h3>
                      <p className={`text-xs mt-1 ${selectedShop?.name === shop.name ? 'text-indigo-100' : 'text-slate-500'}`}>
                        Tirana • Open
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedShop?.name === shop.name
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      {formatDistance(shop.distance)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="lg:col-span-7 h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
          <MapContainer
            center={userPos}
            zoom={14}
            minZoom={12}
            maxZoom={18}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              noWrap={true}
            />

            {selectedShop && <RecenterMap center={selectedShop.location} />}

            {/* User Marker */}
            <Marker position={userPos} icon={userIcon}>
              <Popup>
                <div className="text-xs font-semibold text-slate-800">Your Location</div>
              </Popup>
            </Marker>

            {/* Shop Markers */}
            {filteredShops.map((shop, i) => (
              <Marker
                key={i}
                position={shop.location}
                icon={shopIcon}
                eventHandlers={{
                  click: () => setSelectedShop(shop)
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{shop.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">{formatDistance(shop.distance)} away</p>
                    <button
                      onClick={() =>
                        window.open(
                          maps_redirection(shop.location[0], shop.location[1]),
                          "_blank"
                        )
                      }
                      className="w-full py-1 px-3 bg-indigo-600 text-white text-xs rounded-md font-medium hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default BarberShopMap;