import { useState, useEffect } from 'react';
import { edit_shop, getShop, getcatalog } from '../../Api/Shops.js';
import { Camera, MapPinPen, Save, Store, Phone, Clock } from 'lucide-react';

const Edit_Shop = () => {
  const [shop, setShop] = useState();
  const [modal, setModal] = useState(null);
  const [modifiedSlots, setModifiedSlots] = useState({});
  const [catalog, setCatalog] = useState([]);

  const global_services = [
    {
      _id: "694fb9a5113e696035cdbddb",
      service: "qethje"
    },
    {
      _id: "694fb9ca113e696035cdbddf",
      service: "Trajtim Mjekre"
    },
    {
      _id: "694fb9ed113e696035cdbde2",
      service: "Trajtim fytyre"
    },
    {
      _id: "694fb9f4113e696035cdbde5",
      service: "Larje Koke"
    },
    {
      _id: "695188c531c23885e5a1c738",
      service: "Heqje Vetullash"
    }
  ];

  async function handleSubmit() {
    try {
      const formData = new FormData();

      Object.entries(modifiedSlots).forEach(([key, value]) => {
        if (key === "services") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      console.log('modified slots:', modifiedSlots);
      console.log('Submitting modified slots:', formData);
      const response = await edit_shop(shop._id, formData);

      console.log('Shop updated successfully:', response);

      setModifiedSlots({});
      fetchShop();
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  }

  async function fetchShop() {
    try {
      const response = await getShop('Elite%20Barber%20Shop-725');
      setShop(response);

      const catalogResponse = await getcatalog(response._id);
      setCatalog(catalogResponse);

    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  }

  useEffect(() => {
    fetchShop();
  }, []);

  const selectedServices =
    modifiedSlots.services ??
    catalog.map((catalogService) => ({
      service: catalogService.serviceID,
      price: catalogService.price,
    }));

  const toggleService = (serviceId, isNowChecked, defaultPrice = 0) => {
    const updatedServices = isNowChecked
      ? [...selectedServices, { service: serviceId, price: defaultPrice }]
      : selectedServices.filter((s) => s.service !== serviceId);

    setModifiedSlots({
      ...modifiedSlots,
      services: updatedServices,
    });
  };

  const updateServicePrice = (serviceId, newPrice) => {
    const updatedServices = selectedServices.map((s) =>
      s.service === serviceId ? { ...s, price: newPrice } : s
    );

    setModifiedSlots({
      ...modifiedSlots,
      services: updatedServices,
    });
  };
  console.log('modified slots:', modifiedSlots);
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-12 pt-10">
      {/* Facebook Style Cover & Profile Header Header */}
      <div className="max-w-5xl mx-auto bg-white shadow-sm mb-6">
        <div className="relative w-full h-48 sm:h-72 md:h-96 bg-gray-200 group overflow-hidden">
          <img
            src={modifiedSlots.cover_photo ? URL.createObjectURL(modifiedSlots.cover_photo) : shop?.cover_photo || "https://cdn.pixabay.com/animation/2023/11/30/10/11/10-11-02-622_512.gif"}
            alt="cover picture"
            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setModal('cover')}
          />
          <button
            type="button"
            onClick={() => setModal('cover')}
            className="absolute top-2 right-2 md:top-4 md:right-4 bg-white text-indigo-600 px-1.5 py-1 md:px-3 md:py-1.5 hover:scale-110 rounded-md text-sm font-medium flex items-center gap-2  transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="relative px-4 sm:px-8 pb-6 pt-16 sm:pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-gray-200">
          <div className="absolute -top-16 sm:-top-20 left-1/2 sm:left-8 -translate-x-1/2 sm:translate-x-0 group">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
              <img
                src={modifiedSlots.profile_pic ? URL.createObjectURL(modifiedSlots.profile_pic) : shop?.profile_pic || "https://cdn.pixabay.com/animation/2023/11/30/10/11/10-11-02-622_512.gif"}
                alt="profile picture"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setModal('profile')}
              />
              <button
                type="button"
                onClick={() => setModal('profile')}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-semibold cursor-pointer"
              >
                <Camera size={30} />
              </button>
            </div>
          </div>

          <div className="justify-center md:text-left md:ml-40 mt-2 sm:mt-4 flex flex-col items-center md:items-baseline">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {modifiedSlots.name || shop?.name || 'Shop Name'}
            </h1>
            <p className="text-sm text-gray-500">
              <MapPinPen className="w-4 h-4 inline-block mr-1" />
              {modifiedSlots.address || shop?.address || 'Shop Address'}
            </p>
            <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <p>{modifiedSlots.hours_start || shop?.hours_start || 'Opening Time'}</p>
              -
              <p>{modifiedSlots.hours_end || shop?.hours_end || 'Closing Time'}</p>

              <div className="text-sm text-gray-500 flex item items-center gap-2 ml-2">
                <Phone className='w-4 h-4'/>
                {modifiedSlots.phone || shop?.phone || 'Shop Phone Number'}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 w-full sm:w-auto">
            <button
              disabled={Object.values(modifiedSlots).length === 0}
              className={`w-full flex items-center justify-center sm:w-auto ${Object.values(modifiedSlots).length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm active:scale-95`}
              onClick={() => handleSubmit()}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Content Form Body */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Basic Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 border-b border-indigo-700 pb-3 mb-4">Shop Information</h2>

            <div className="space-y-4">
              {/* Shop Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Shop Name
                </label>
                <div className="group flex items-center gap-2">
                  <label
                    htmlFor="name"
                    className="text-gray-500 group-focus-within:text-indigo-600 transition cursor-pointer"
                  >
                    <Store />
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder={shop?.name || 'Shop Name'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                    value={modifiedSlots.name || ''}
                    onChange={(e) => setModifiedSlots({ ...modifiedSlots, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Address
                </label>
                <div className="group flex items-center gap-2">
                  <label
                    htmlFor="address"
                    className="text-gray-500 group-focus-within:text-indigo-600 transition cursor-pointer"
                  >
                    <MapPinPen />
                  </label>
                  <input
                    type="text"
                    id="address"
                    placeholder={shop?.address || 'Shop Address'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                    value={modifiedSlots.address || ''}
                    onChange={(e) => setModifiedSlots({ ...modifiedSlots, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Phone Number
                </label>
                <div className="group flex items-center gap-2">
                  <label
                    htmlFor="phone"
                    className="text-gray-500 group-focus-within:text-indigo-600 transition cursor-pointer"
                  >
                    <Phone />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder={shop?.phone || 'Shop Phone Number'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                    value={modifiedSlots.phone || ''}
                    onChange={(e) => setModifiedSlots({ ...modifiedSlots, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label htmlFor="hours_start" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Opening Time
                  </label>
                  <div className="group flex items-center gap-2">
                    <label
                      htmlFor="hours_start"
                      className="text-gray-500 group-focus-within:text-indigo-600 transition cursor-pointer"
                    >
                    </label>
                    <input
                      type="time"
                      id="hours_start"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                      value={modifiedSlots.hours_start || shop?.hours_start || ''}
                      onChange={(e) =>
                        setModifiedSlots({
                          ...modifiedSlots,
                          hours_start: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hours_end" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Closing Time
                  </label>
                  <div className="group flex items-center gap-2">
                    <label
                      htmlFor="hours_end"
                      className="text-gray-500 group-focus-within:text-indigo-600 transition cursor-pointer"
                    >
                    </label>
                    <input
                      type="time"
                      id="hours_end"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                      value={modifiedSlots.hours_end || shop?.hours_end || ''}
                      onChange={(e) =>
                        setModifiedSlots({
                          ...modifiedSlots,
                          hours_end: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Catalog/Services */}
        <div className="md:col-span-2">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Catalog Services</h2>

            <div className="space-y-3">
              {global_services.map((service) => {
                const selectedService = selectedServices.find(
                  (s) => s.service === service._id
                );
                const isChecked = Boolean(selectedService);

                return (
                  <div
                    key={service._id}
                    className={`border rounded-lg p-4 transition-all ${isChecked ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                          checked={isChecked}
                          onChange={(e) =>
                            toggleService(service._id, e.target.checked, service.price)
                          }
                        />
                        <span className="text-base font-semibold text-gray-900">{service.service}</span>
                      </label>

                      {isChecked && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0"
                            maxLength={4}
                            value={selectedService.price}
                            onChange={(e) => {
                              // Allow only digits (removes 'e', '.', '-', and other non-numeric chars on PC)
                              const numericValue = e.target.value.replace(/\D/g, '');
                              updateServicePrice(service._id, numericValue === '' ? 0 : Number(numericValue));
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 w-28 text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                          <label className="text-xs font-semibold text-indigo-600 tracking-widest font-BlackOps">lek</label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Image Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                Upload {modal} Picture
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
              <img
                src={modal === 'profile' ?
                  (modifiedSlots.profile_pic ? URL.createObjectURL(modifiedSlots.profile_pic) : shop?.profile_pic || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJrw6PCybvftapl-XzrvjlFb0KYJ65si8fC9W5iBWqeBId4Pt61Iovi9NP&s=10")
                  : (modifiedSlots.cover_photo ? URL.createObjectURL(modifiedSlots.cover_photo) : shop?.cover_photo || "https://loading.io/assets/mod/spinner/rolling/lg.gif")}
                alt="Preview"
                className="max-h-60 rounded object-contain"
              />
            </div>

            <div>
              <input
                type='file'
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                onChange={(e) => {
                  if (modal === 'profile') {
                    setModifiedSlots({ ...modifiedSlots, profile_pic: e.target.files[0] });
                  } else if (modal === 'cover') {
                    setModifiedSlots({ ...modifiedSlots, cover_photo: e.target.files[0] });
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                onClick={() => setModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Edit_Shop;