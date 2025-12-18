import axios from "axios";
const Api = 'http://localhost:5000/reservations/reserve'

async function reservation(reservationData) {
    try {
        const response = await axios.post(`${Api}`, reservationData);
        return response.data;
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

export { reservation };