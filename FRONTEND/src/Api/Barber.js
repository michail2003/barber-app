import axios from 'axios';
const API_Shop = "http://localhost:5000/manage-barbershop"

async function add_barber(barberData) {
    try {
        const response = await axios.post(`${API_Shop}/add-barber`, barberData);
        return response.data;
    } catch (error) {
        console.error('Error fetching shops:', error);
        throw error;
    }
}

async function barber_exit(id) {
    try {
        const response = await axios.post(`${API_Shop}/barber-exit/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error updating:', error);
        throw error;
    }
}

export { add_barber,barber_exit };