import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Store, 
  MapPin, 
  Scissors, 
  Check, 
  X, 
  Save, 
  Camera, 
  Phone, 
  Clock, 
  Link as LinkIcon, 
  Globe,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// GLOBAL MASTER SERVICES
const GLOBAL_SERVICES = [
  { id: '65e1f101a1b2c3d4e5f60001', name: 'Classic Haircut', defaultPrice: 25 },
  { id: '65e1f101a1b2c3d4e5f60002', name: 'Beard Trim & Lineup', defaultPrice: 15 },
  { id: '65e1f101a1b2c3d4e5f60003', name: 'Hot Towel Shave', defaultPrice: 20 },
  { id: '65e1f101a1b2c3d4e5f60004', name: 'Full Hair & Beard Combo', defaultPrice: 35 },
  { id: '65e1f101a1b2c3d4e5f60005', name: 'Kids Fade', defaultPrice: 18 },
  { id: '65e1f101a1b2c3d4e5f60006', name: 'Scalp Detox & Wash', defaultPrice: 30 },
  { id: '65e1f101a1b2c3d4e5f60007', name: 'Hair Color Treatment', defaultPrice: 45 },
];

// INITIAL SAMPLE DATA
const INITIAL_SHOP_DATA = {
  name: 'Apex Barber Studio',
  slug: 'apex-barber-studio',
  address: '450 Boulevard Ave, Suite 101',
  location: {
    type: 'Point',
    coordinates: [-73.98513, 40.748817] // [lng, lat]
  },
  phone: '+1 (555) 019-2834',
  hours_start: '09:00',
  hours_end: '20:00',
  logo_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80',
  shop_img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  services: [
    { service: '65e1f101a1b2c3d4e5f60001', service_name: 'Classic Haircut', price: 28 },
    { service: '65e1f101a1b2c3d4e5f60002', service_name: 'Beard Trim & Lineup', price: 18 },
    { service: '65e1f101a1b2c3d4e5f60004', service_name: 'Full Hair & Beard Combo', price: 40 },
  ]
};

function MinimalMapMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lng, e.latlng.lat]);
    },
  });

  return position ? <Marker position={[position[1], position[0]]} /> : null;
}

export default function Edit_Shop() {
  const [formData, setFormData] = useState(INITIAL_SHOP_DATA);
  const [submittedPayload, setSubmittedPayload] = useState(null);

  // Fullscreen Modal State
  const [activeImageField, setActiveImageField] = useState(null); // 'shop_img' | 'logo_url' | null
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (newCoords) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: newCoords
      }
    }));
  };

  const toggleService = (globalItem) => {
    setFormData((prev) => {
      const exists = prev.services.some((s) => s.service === globalItem.id);
      if (exists) {
        return {
          ...prev,
          services: prev.services.filter((s) => s.service !== globalItem.id)
        };
      } else {
        return {
          ...prev,
          services: [
            ...prev.services,
            {
              service: globalItem.id,
              service_name: globalItem.name,
              price: globalItem.defaultPrice
            }
          ]
        };
      }
    });
  };

  const handlePriceChange = (serviceId, newPrice) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.service === serviceId ? { ...s, price: Number(newPrice) || 0 } : s
      )
    }));
  };

  // ----------------------------------------------------------------------
  // IMAGE PICKER / MODAL HANDLERS
  // ----------------------------------------------------------------------
  const openImageModal = (field) => {
    setActiveImageField(field);
    setUrlInput(formData[field] || '');
  };

  const closeImageModal = () => {
    setActiveImageField(null);
    setUrlInput('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localPreviewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [activeImageField]: localPreviewUrl
      }));
      closeImageModal();
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        [activeImageField]: urlInput.trim()
      }));
    }
    closeImageModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      slug: formData.slug.toLowerCase().trim().replace(/\s+/g, '-')
    };
    setSubmittedPayload(payload);
  };

  const activeServiceIds = formData.services.map((s) => s.service);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-16 mt-10">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">Shop Settings</h1>
            <p className="text-xs text-gray-500">Manage shop profile, location, and service pricing</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow transition duration-150 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-8">
        
        {/* ==================================================================== */}
        {/* LIGHT MODE FACEBOOK STYLE COVER & LOGO HEADER */}
        {/* ==================================================================== */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Cover Photo Button */}
          <div 
            onClick={() => openImageModal('shop_img')}
            className="relative h-48 md:h-64 w-full bg-gray-200 cursor-pointer group"
          >
            <img 
              src={formData.shop_img || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"} 
              alt="Shop Cover" 
              className="w-full h-full object-cover transition group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-white/90 text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2 backdrop-blur-sm">
                <Camera className="w-4 h-4 text-indigo-600" />
                Change Cover Photo
              </span>
            </div>
            
            <button
              type="button"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3.5 py-2 rounded-lg shadow border border-gray-200 flex items-center gap-2 transition backdrop-blur-sm"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              Edit Cover
            </button>
          </div>

          {/* Profile Header Bar */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100">
            
            {/* Logo Avatar Overlapping */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 md:-mt-20">
              <div 
                onClick={() => openImageModal('logo_url')}
                className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md flex-shrink-0 cursor-pointer group"
              >
                <img 
                  src={formData.logo_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80"} 
                  alt="Shop Logo" 
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1 mb-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{formData.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    {formData.address}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {formData.hours_start} - {formData.hours_end}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl self-start md:self-auto">
              <Scissors className="w-4 h-4 text-indigo-600" />
              <span className="text-gray-700 font-medium">{formData.services.length} Services Enabled</span>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* MAIN FORM GRID */}
        {/* ==================================================================== */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Basic Details & Location (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                General Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shop Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Opens At</label>
                    <input
                      type="time"
                      name="hours_start"
                      value={formData.hours_start}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Closes At</label>
                    <input
                      type="time"
                      name="hours_end"
                      value={formData.hours_end}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Minimal Map Picker */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Map Pin Location
                </h3>
                <div className="text-[11px] font-mono text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
                  [{formData.location.coordinates[0].toFixed(4)}, {formData.location.coordinates[1].toFixed(4)}]
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Click map to select pinpoint location <span className="text-gray-400">(Saved as [Longitude, Latitude])</span>.
              </p>

              <div className="h-56 w-full rounded-xl overflow-hidden border border-gray-200 relative">
                <MapContainer
                  center={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                  zoom={13}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MinimalMapMarker
                    position={formData.location.coordinates}
                    onPositionChange={handleLocationChange}
                  />
                </MapContainer>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Global Service Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Global Services Catalog
                </h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                  {formData.services.length} Enabled
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Toggle global services for this shop and set custom pricing.
              </p>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {GLOBAL_SERVICES.map((globalItem) => {
                  const isActive = activeServiceIds.includes(globalItem.id);
                  const activeService = formData.services.find((s) => s.service === globalItem.id);

                  return (
                    <div
                      key={globalItem.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-indigo-50/50 border-indigo-600 text-gray-900 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleService(globalItem)}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                            isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-medium truncate ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                            {globalItem.name}
                          </span>
                        </button>

                        {isActive && (
                          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm">
                            <span className="text-xs text-indigo-600 font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              value={activeService ? activeService.price : globalItem.defaultPrice}
                              onChange={(e) => handlePriceChange(globalItem.id, e.target.value)}
                              className="w-12 bg-transparent text-xs text-right font-semibold text-gray-900 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </form>

        {/* PAYLOAD PREVIEW */}
        {submittedPayload && (
          <div className="bg-white border border-indigo-200 rounded-xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Backend API Payload Generated
              </h3>
              <button 
                onClick={() => setSubmittedPayload(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="bg-gray-900 p-4 rounded-lg text-xs text-emerald-400 overflow-x-auto font-mono">
              {JSON.stringify(submittedPayload, null, 2)}
            </pre>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* FULLSCREEN PHOTO SELECTION MODAL */}
      {/* ==================================================================== */}
      {activeImageField && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Update {activeImageField === 'shop_img' ? 'Cover Photo' : 'Shop Logo'}
                </h3>
              </div>
              <button 
                onClick={closeImageModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Image Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
                <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                  <img 
                    src={urlInput || formData[activeImageField]} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Input Method 1: Local Storage Upload */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option 1: Upload from Storage</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-600 bg-gray-50 hover:bg-indigo-50/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition group"
                >
                  <div className="p-3 bg-white group-hover:bg-indigo-600 text-gray-600 group-hover:text-white rounded-full shadow-sm transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Click to choose a photo from device</span>
                  <span className="text-xs text-gray-400">Supports PNG, JPG, WEBP</span>
                </button>
              </div>

              {/* Input Method 2: Image URL */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option 2: Image URL</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeImageModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
              >
                Apply Image
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}