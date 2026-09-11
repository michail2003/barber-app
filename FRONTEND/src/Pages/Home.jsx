import React, { useEffect, useState } from 'react';
import { getShops } from '../Api/Shops';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Navigation,
  Scissors,
  Star,
  Heart,
  Users,
  SquareArrowRight
} from 'lucide-react';

const Home = () => {
  const [shops, setShops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

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

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.log('Location permission denied or unavailable');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const getDistance = (shop) => {
    if (!userLocation || !shop.location?.coordinates) {
      return null;
    }

    const [lat, lng] = shop.location.coordinates;

    const R = 6371;

    const dLat = (lat - userLocation.lat) * Math.PI / 180;
    const dLng = (lng - userLocation.lng) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(userLocation.lat * Math.PI / 180) *
      Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

    const distanceKm = R * c;
    const distanceMeters = distanceKm * 1000;

    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    }

    return `${distanceKm.toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* =========================
          HERO / BANNER SECTION
          ========================= */}
      <section className="relative bg-[#0b0b10] overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(79,70,229,0.3),transparent_35%)]" />

        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-7">
              <span className="w-8 h-px bg-indigo-500" />
              FIND YOUR STYLE
            </div>

            <h1 className="text-white text-5xl md:text-7xl font-black tracking-[-0.055em] leading-[0.95]">
              Your next
              <span className="block text-indigo-500">
                great cut.
              </span>
            </h1>

            <p className="mt-7 text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
              Discover exceptional barbers, explore their work,
              and book your next appointment effortlessly.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-gray-300 text-sm">
                <Scissors className="w-4 h-4 text-indigo-400" />
                <span>{shops.length} barbershops</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-gray-300 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>Top rated professionals</span>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================
          SHOPS SECTION
          ========================= */}
      <main className="max-w-7xl mx-auto px-6 py-14">

        <div className="flex items-end justify-between mb-8">

          <div>

            <p className="text-indigo-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">
              Discover
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
              Top barbershops
            </h2>

          </div>

          <span className="text-sm font-medium text-gray-400">
            {shops.length} available
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

          {shops.map((shop, idx) => {

            const coverPhoto =
              shop.cover_photo ||
              "https://images.unsplash.com/photo-1593273784416-8d2d368f9785?auto=format&fit=crop&w=1000&q=90";

            const profilePic =
              shop.profile_pic ||
              "https://images.unsplash.com/photo-1613588686418-5f45b2a0a51a?auto=format&fit=crop&w=400&q=90";

            const rating = shop.rating ?? 0;

            const reviewCount =
              shop.review_count ??
              shop.reviews?.length ??
              0;

            const barberCount =
              shop.barber_count ??
              shop.barbers?.length ??
              5;

            const distance = getDistance(shop);

            return (

              <Link
                to={`/${shop.slug}`}
                key={idx}
                className="group"
              >

                <article className="bg-white rounded-[26px] overflow-hidden shadow-[0_8px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_55px_rgba(79,70,229,0.14)] transition-all duration-500">

                  <div className="relative h-64 overflow-hidden">

                    <img
                      src={coverPhoto}
                      alt={`${shop.name} cover`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />


                    <div className="absolute top-4 left-4">

                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/10 text-indigo-600 px-3 py-2 rounded-full text-xs font-semibold">

                        {shop.favourite ? (
                          <Heart fill="currentColor" />
                        ) : (
                          <Heart />
                        )}

                      </div>

                    </div>


                    <div className="absolute top-4 right-4">

                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl text-gray-900 px-3 py-2 rounded-full text-xs font-semibold">

                        <Clock className="w-3.5 h-3.5 text-indigo-600" />

                        {shop.hours_start && shop.hours_end
                          ? `${shop.hours_start} - ${shop.hours_end}`
                          : 'Open Daily'}

                      </div>

                    </div>


                    <div className="absolute bottom-5 left-5 right-5">

                      <h3 className="text-2xl font-black text-white tracking-tight">
                        {shop.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1.5 text-white/70 text-sm">

                        <MapPin className="w-3.5 h-3.5 shrink-0" />

                        <span className="truncate max-w-[260px]">
                          {shop.address || 'Address unavailable'}
                        </span>

                      </div>

                    </div>

                  </div>


                  <div className="px-5 py-5">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-gray-100 shrink-0">

                        <img
                          src={profilePic}
                          alt={`${shop.name} logo`}
                          className="w-full h-full object-cover"
                        />

                      </div>


                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-1.5">

                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />

                          <span className="text-sm font-bold text-gray-900">

                            {rating > 0
                              ? rating.toFixed(1)
                              : 'New'}

                          </span>

                          <span className="text-xs text-gray-400">
                            ({reviewCount})
                          </span>

                        </div>


                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">

                          <div className="flex items-center gap-1">

                            <Users className="w-4 h-4 text-indigo-700" />

                            <span>
                              {barberCount}{' '}
                              {barberCount === 1
                                ? 'barber'
                                : 'barbers'}
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* Distance badge */}
                      <div
                        className={`items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-xs font-bold ${distance ? 'flex' : 'hidden'
                          }`}
                      >

                        <Navigation className="w-4 h-4" />

                        {distance}

                      </div>

                    </div>


                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">

                      <div className="group/reservo flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-[0_6px_20px_rgba(79,70,229,0.25)] transition-all duration-300">

                        <span className="text-xs font-bold tracking-wide">
                          Reservo
                        </span>

                        <span className="text-sm font-black transition-transform duration-300 group-hover/reservo:translate-x-0.5">
                          <SquareArrowRight className="w-4.5 h-4.5" />
                        </span>

                      </div>

                    </div>

                  </div>

                </article>

              </Link>
            );
          })}

        </div>

      </main>

    </div>
  );
};

export default Home;