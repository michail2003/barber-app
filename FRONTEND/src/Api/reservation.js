import axios from "axios";
const Api = 'http://localhost:5000/reservations'

async function reservation(reservationData) {
    try {
        const response = await axios.post(`${Api}/reserve`, reservationData);
        return response.data;
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

async function barber_reservations(barberid) {
    try {
        const response = await axios.get(`${Api}/${barberid}/reservations`);
        return response.data
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

async function barbers_available(shop,data) {
    try {
        const response = await axios.post(`${Api}/${shop}/all/reservations`,data);
        return response.data
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}
export { reservation, barber_reservations,barbers_available };