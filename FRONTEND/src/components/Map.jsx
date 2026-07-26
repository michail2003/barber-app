import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const RecenterMap = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.2 });
        }
    }, [center, map]);

    return null;
};

const Map = ({ shop }) => {
    const [userPos, setUserPos] = useState(null);

    function maps_redirection(lat, lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const location = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(location);
                localStorage.setItem("location", JSON.stringify(location));
            },
            (err) => {
                console.error(err);
            }
        );
    }, []);


    if (!userPos) {
        return (
            <div className="lg:col-span-7 h-[400px] flex items-center justify-center border rounded-2xl">
                Loading map...
            </div>
        );
    }

    return (
        <div className="lg:col-span-7 h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
            <MapContainer
                center={shop.location.coordinates}
                zoom={15}
                minZoom={10}
                maxZoom={20}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <RecenterMap center={shop.location.coordinates} />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    noWrap={true}
                />

                <Marker position={userPos} icon={userIcon}>
                    <Popup>
                        <div className="text-xs font-semibold text-slate-800">
                            Your Location
                        </div>
                    </Popup>
                </Marker>

                <Marker
                    position={shop.location.coordinates}
                    icon={shopIcon}
                >
                    <Popup>
                        <div className="p-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">
                                {shop.name}
                            </h4>

                            <p className="text-xs text-slate-500 mb-2">
                                1.3 km away
                            </p>

                            <button
                                onClick={() =>
                                    window.open(
                                        maps_redirection(
                                            shop.location.coordinates[0],
                                            shop.location.coordinates[1]
                                        ),
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
            </MapContainer>
        </div>
    );
};

export default Map;