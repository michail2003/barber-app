import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { edit_shop, getShop } from '../../Api/Shops.js';
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

function MinimalMapMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lng, e.latlng.lat]);
    },
  });

  return position ? <Marker position={[position[1], position[0]]} /> : null;
}

export default function Edit_Shop() {
  // Original data received from GET
  const [shopData, setShopData] = useState(null);

  // Editable copy
  const [formData, setFormData] = useState(null);

  // Only fields changed by the user
  const [changedFields, setChangedFields] = useState({});

  const [submittedPayload, setSubmittedPayload] = useState(null);

  // Image preview URLs
  const [imagePreviews, setImagePreviews] = useState({});

  // Fullscreen Modal State
  const [activeImageField, setActiveImageField] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // ----------------------------------------------------------------------
  // GET SHOP
  // ----------------------------------------------------------------------

  const loadShop = async () => {
    try {
      const data = await getShop('Elite Barber Shop-725');

      // Original GET data
      setShopData(data);

      // Editable copy
      setFormData(structuredClone(data));

      // Clear changed fields after loading fresh data
      setChangedFields({});

      // Clear temporary image previews
      setImagePreviews({});
    } catch (error) {
      console.error('Error loading shop:', error);
    }
  };

  useEffect(() => {
    loadShop();
  }, []);

  // ----------------------------------------------------------------------
  // CHECK IF VALUE CHANGED
  // ----------------------------------------------------------------------

  const isSameValue = (value1, value2) => {
    if (
      typeof value1 === 'object' &&
      value1 !== null &&
      typeof value2 === 'object' &&
      value2 !== null
    ) {
      return JSON.stringify(value1) === JSON.stringify(value2);
    }

    return value1 === value2;
  };

  // ----------------------------------------------------------------------
  // TRACK CHANGED FIELD
  // ----------------------------------------------------------------------

  const trackChange = (name, value) => {
    setChangedFields((prev) => {
      // If the user changed it back to the original value,
      // remove it from the update payload.
      if (shopData && isSameValue(value, shopData[name])) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }

      return {
        ...prev,
        [name]: value
      };
    });
  };

  // ----------------------------------------------------------------------
  // NORMAL FORM CHANGES
  // ----------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    trackChange(name, value);
  };

  // ----------------------------------------------------------------------
  // LOCATION
  // ----------------------------------------------------------------------

  const handleLocationChange = (newCoords) => {
    const newLocation = {
      ...formData.location,
      coordinates: newCoords
    };

    setFormData((prev) => ({
      ...prev,
      location: newLocation
    }));

    trackChange('location', newLocation);
  };

  // ----------------------------------------------------------------------
  // SERVICES
  // ----------------------------------------------------------------------

  const toggleService = (globalItem) => {
    const exists = formData.services.some(
      (s) => s.service === globalItem.id
    );

    const newServices = exists
      ? formData.services.filter(
          (s) => s.service !== globalItem.id
        )
      : [
          ...formData.services,
          {
            service: globalItem.id,
            service_name: globalItem.name,
            price: globalItem.defaultPrice
          }
        ];

    setFormData((prev) => ({
      ...prev,
      services: newServices
    }));

    trackChange('services', newServices);
  };

  const handlePriceChange = (serviceId, newPrice) => {
    const newServices = formData.services.map((s) =>
      s.service === serviceId
        ? { ...s, price: Number(newPrice) || 0 }
        : s
    );

    setFormData((prev) => ({
      ...prev,
      services: newServices
    }));

    trackChange('services', newServices);
  };

  // ----------------------------------------------------------------------
  // IMAGE PICKER / MODAL HANDLERS
  // ----------------------------------------------------------------------

  const openImageModal = (field) => {
    setActiveImageField(field);

    // If current value is a URL, put it in the URL input.
    // If it's a File, leave URL input empty.
    const currentValue = formData?.[field];

    setUrlInput(
      typeof currentValue === 'string'
        ? currentValue
        : ''
    );
  };

  const closeImageModal = () => {
    setActiveImageField(null);
    setUrlInput('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file || !activeImageField) return;

    // Store actual File in formData
    setFormData((prev) => ({
      ...prev,
      [activeImageField]: file
    }));

    // File is always a changed field
    setChangedFields((prev) => ({
      ...prev,
      [activeImageField]: file
    }));

    // Create temporary browser preview
    const previewUrl = URL.createObjectURL(file);

    setImagePreviews((prev) => ({
      ...prev,
      [activeImageField]: previewUrl
    }));

    closeImageModal();

    // Allow selecting the same file again later
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    const url = urlInput.trim();

    if (url && activeImageField) {
      setFormData((prev) => ({
        ...prev,
        [activeImageField]: url
      }));

      trackChange(activeImageField, url);

      setImagePreviews((prev) => ({
        ...prev,
        [activeImageField]: url
      }));
    }

    closeImageModal();
  };

  // ----------------------------------------------------------------------
  // CREATE MULTIPART FORMDATA
  // ----------------------------------------------------------------------

  const createFormData = (data) => {
    const multipartData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      // Files are appended directly
      if (value instanceof File) {
        multipartData.append(key, value);
        return;
      }

      // Arrays and objects are converted to JSON
      if (typeof value === 'object') {
        multipartData.append(key, JSON.stringify(value));
        return;
      }

      // Strings, numbers, booleans, etc.
      multipartData.append(key, value);
    });

    return multipartData;
  };

  // ----------------------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData) return;

    try {
      // Only changed fields are converted to multipart FormData
      const data = createFormData(changedFields);

      console.log('Changed fields:', changedFields);

      const response = await edit_shop(
        formData._id,
        data
      );

      console.log('Shop updated successfully:', response);

      // Show only what was actually sent
      setSubmittedPayload(changedFields);

      // Get fresh data from database
      await loadShop();

    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  const activeServiceIds =
    formData?.services?.map((s) => s.service) || [];

  // ----------------------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------------------

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading shop...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-16 mt-10">

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Store className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">
              Shop Settings
            </h1>

            <p className="text-xs text-gray-500">
              Manage shop profile, location, and service pricing
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow transition duration-150 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-8">

        {/* COVER / PROFILE */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Cover Photo */}
          <div
            onClick={() => openImageModal('cover_photo')}
            className="relative h-48 md:h-64 w-full bg-gray-200 cursor-pointer group"
          >
            <img
              src={
                imagePreviews.cover_photo ||
                (typeof formData.cover_photo === 'string'
                  ? formData.cover_photo
                  : "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80")
              }
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
              onClick={(e) => {
                e.stopPropagation();
                openImageModal('cover_photo');
              }}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3.5 py-2 rounded-lg shadow border border-gray-200 flex items-center gap-2 transition backdrop-blur-sm"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              Edit Cover
            </button>
          </div>

          {/* Profile Header */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100">

            {/* Logo */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 md:-mt-20">
              <div
                onClick={() => openImageModal('profile_pic')}
                className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md flex-shrink-0 cursor-pointer group"
              >
                <img
                  src={
                    imagePreviews.profile_pic ||
                    (typeof formData.profile_pic === 'string'
                      ? formData.profile_pic
                      : "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80")
                  }
                  alt="Shop Logo"
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1 mb-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {formData.name}
                </h2>

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

            {/* Services Count */}
            <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl self-start md:self-auto">
              <Scissors className="w-4 h-4 text-indigo-600" />
              <span className="text-gray-700 font-medium">
                {formData.services?.length || 0} Services Enabled
              </span>
            </div>
          </div>
        </section>

        {/* MAIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">

            {/* General Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                General Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Shop Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Slug
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />

                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />

                    <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Opens At
                    </label>

                    <input
                      type="time"
                      name="hours_start"
                      value={formData.hours_start || ''}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Closes At
                    </label>

                    <input
                      type="time"
                      name="hours_end"
                      value={formData.hours_end || ''}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                    />
                  </div>

                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Street Address *
                </label>

                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Global Services Catalog
                </h3>

                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                  {formData.services?.length || 0} Enabled
                </span>

              </div>

              <p className="text-xs text-gray-500">
                Toggle global services for this shop and set custom pricing.
              </p>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">

                {GLOBAL_SERVICES.map((globalItem) => {

                  const isActive =
                    activeServiceIds?.includes(globalItem.id);

                  const activeService =
                    formData.services?.find(
                      (s) => s.service === globalItem.id
                    );

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

                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isActive
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isActive && (
                              <Check className="w-3 h-3 stroke-[3]" />
                            )}
                          </div>

                          <span
                            className={`text-xs font-medium truncate ${
                              isActive
                                ? 'text-gray-900 font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            {globalItem.name}
                          </span>

                        </button>

                        {isActive && (
                          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm">

                            <span className="text-xs text-indigo-600 font-bold">
                              $
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={
                                activeService
                                  ? activeService.price
                                  : globalItem.defaultPrice
                              }
                              onChange={(e) =>
                                handlePriceChange(
                                  globalItem.id,
                                  e.target.value
                                )
                              }
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
                type="button"
                onClick={() => setSubmittedPayload(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <pre className="bg-gray-900 p-4 rounded-lg text-xs text-emerald-400 overflow-x-auto font-mono">
              {JSON.stringify(
                submittedPayload,
                (key, value) =>
                  value instanceof File
                    ? `[File: ${value.name}]`
                    : value,
                2
              )}
            </pre>

          </div>
        )}

      </main>

      {/* PHOTO MODAL */}
      {activeImageField && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">

          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <ImageIcon className="w-5 h-5 text-indigo-600" />

                <h3 className="text-base font-bold text-gray-900">
                  Update {
                    activeImageField === 'cover_photo'
                      ? 'Cover Photo'
                      : 'Shop Logo'
                  }
                </h3>

              </div>

              <button
                type="button"
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

                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Preview
                </span>

                <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">

                  <img
                    src={
                      imagePreviews[activeImageField] ||
                      (
                        typeof formData?.[activeImageField] === 'string'
                          ? formData[activeImageField]
                          : ''
                      )
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                </div>

              </div>

              {/* Upload */}
              <div className="space-y-2">

                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Option 1: Upload from Storage
                </span>

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

                  <span className="text-sm font-semibold text-gray-800">
                    Click to choose a photo from device
                  </span>

                  <span className="text-xs text-gray-400">
                    Supports PNG, JPG, WEBP
                  </span>

                </button>

              </div>

              {/* URL */}
              <div className="space-y-2">

                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Option 2: Image URL
                </span>

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
