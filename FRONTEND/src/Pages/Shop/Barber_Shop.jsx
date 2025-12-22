import { useState, useEffect } from 'react'
import { getShop, getbarbers } from '../../Api/Shops';
import { data, Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import { reservation, barbers_available } from '../../Api/reservation';
import dayjs from 'dayjs';
import { ProtectedButton } from '../../components/ProtectedButton';


const Barber_Shop = () => {
  const [shop, setShop] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [reservationData, setReservationData] = useState({
    barberId: '',
    serviceId: '',
    start: '',
    customer_name: '',
    customer_phone: ''
  });
  const [availableBarbers, setavailableBarbers] = useState([])

  const slug = window.location.pathname.substring(1);

  const fetchShop = async () => {
    try {
      const data = await getShop(slug);
      setShop(data);
    }
    catch (error) {
      console.error('Failed to fetch shop:', error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const data = await getbarbers(slug);
      setBarbers(data);
    }
    catch (error) {
      console.error('Failed to fetch barbers:', error);
    }
  };

  async function handleReservation() {
    await reservation({
      barberId: reservationData.barberId,
      serviceId: reservationData.serviceId,
      start: reservationData.start,
      customer_name: reservationData.customer_name,
      customer_phone: reservationData.customer_phone,
    })
      .then(() => {
        alert('Reservation successful');
      })
      .catch((error) => {
        alert(`is booked`)
      });
  }

  async function available_barbers() {
    try {
      const shop = localStorage.getItem('shop')
      const data = await barbers_available(shop,)
      setavailableBarbers(data)
    } catch (err) {
      alert
    }
  }
  useEffect(() => {
    fetchShop();
    fetchBarbers();
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Shop Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            {shop.name}
          </h1>
          <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 gap-8">
          {barbers.map((barber) => (
            <div key={barber._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8">

                {/* Barber Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                      {barber.userId?.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📞 {barber.userId?.ph_number}</span>
                      <span>🕒 {barber.hours}</span>
                    </div>
                  </div>
                </div>

                {/* Services Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Available Services</h4>
                  <ul className="space-y-4">
                    {barber.services.map((service, index) => (
                      <li key={index} className="bg-gray-50 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.duration} mins • <span className="text-blue-600 font-bold">${service.price}</span></p>
                        </div>

                        {/* Booking Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar
                            value={selectedDateTime}
                            onChange={setSelectedDateTime}
                          />
                          <button
                            className='cursor-pointer bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition'
                            onClick={() => setReservationData({
                              barberId: barber._id,
                              serviceId: service._id,
                              start: selectedDateTime,
                              customer_name: localStorage.getItem('name') || 'guest',
                              customer_phone: localStorage.getItem('phone') || 'no phone provided',
                            })}
                          >
                            Select
                          </button>
                          <button
                            className='cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95'
                            onClick={handleReservation}
                          >
                            Book Now
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='flex flex-col gap-2 w-1/5'>
          <Calendar
            value={selectedDateTime}
            onChange={setSelectedDateTime}
          />
          <button className='cursor-pointer px-2 py-1 border-2 rounded-xl' onClick={available_barbers}>check availability</button>
          <div className='flex gap-2'>
          </div>
        </div>
        {/* Footer Actions */}
        <ProtectedButton roles={['barber_admin', 'admin']}>
          <div className="mt-12 text-center">
            <Link to={`/${slug}/barber`} className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transform transition hover:-translate-y-1">
              + Add New Barber
            </Link>
          </div>
        </ProtectedButton>
      </div>
    </div>
  )
}
export default Barber_Shop