import axios from 'axios';
const API_Shop = "http://localhost:5000/manage-barbershop"
const staff_API = 'http://localhost:5000/staff-managment'

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
        const response = await axios.delete(`${staff_API}/remove-staff/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error updating:', error);
        throw error;
    }
}

async function barber_edit(id,data) {
    try {
        const response = await axios.put(`${staff_API}/update-staff/${id}/`,data);
        return response.data;
    } catch (error) {
        console.error('Error updating:', error);
        throw error;
    }
}

async function get_barber_list(id) {
    try {
        const response = await axios.get(`${staff_API}/shop-staff/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error updating:', error);
        throw error;
    }
}
export { add_barber, barber_exit, barber_edit, get_barber_list};