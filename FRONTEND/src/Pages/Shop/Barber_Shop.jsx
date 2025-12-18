import { useState, useEffect } from 'react'
import { getShop, getbarbers } from '../../Api/Shops';
import { Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import { reservation } from '../../Api/reservation';
import dayjs from 'dayjs';

const Barber_Shop = () => {
  const [shop, setShop] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [reservationData, setReservationData] = useState({
    barberId: '',
    serviceId: '',
    start: '',
    customer_name: '',
    customer_phone: '',
  });
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
    }

    )
      .then((data) => {
        console.log('Reservation successful:', data);
      })
      .catch((error) => {
        console.error('Reservation failed:', error);
      });
  }
  console.log(reservationData)
  useEffect(() => {
    fetchShop();
    fetchBarbers();
  }, []);
  return (

    <div>

      {shop.name}
      <br />
      {barbers.map((barber) => (
        <div key={barber._id} className="border p-4 m-4 rounded shadow">
          <h3 className="text-xl font-bold">{barber.name}</h3>
          <p>Phone: {barber.phone}</p>
          <p>Hours: {barber.hours}</p>
          <div>Services:
            <ul>
              {barber.services.map((service, index) => (
                <li key={index}>{service.name} - ${service.price} - {service.duration} mins
                  <button className='cursor-pointer ml-10 border-2 px-2' onClick={()=>

                    setReservationData({
                      barberId: barber._id,
                      serviceId: service._id,
                      start: selectedDateTime,
                      customer_name: 'test',
                      customer_phone: '+0000000',
                    })  
                  }>reserve
                  </button>
                  <button className = 'cursor-pointer ml-10 border-2 px-2'onClick={handleReservation}>
                    submit
                  </button>
                  <Calendar
                    value={selectedDateTime}
                    onChange={setSelectedDateTime}
                  /></li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <br />
      <Link to={`/${slug}/barber`} className="m-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Add Barber
      </Link>

    </div>
  )
}

export default Barber_Shop