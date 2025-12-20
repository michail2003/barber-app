import axios from 'axios';

const API_URL = "http://localhost:5000/api/staff"; // Update with your actual backend URL

export const staffApi = {
    // Get all staff for the shop
    fetchStaff: async (shopId) => {
        const response = await axios.get(`${API_URL}/shop-staff/${shopId}`);
        return response.data;
    },

    // Update staff details
    updateStaff: async (barberId, data) => {
        const response = await axios.put(`${API_URL}/update-staff/${barberId}`, data);
        return response.data;
    },

    // Delete staff profile
    deleteStaff: async (barberId) => {
        const response = await axios.delete(`${API_URL}/remove-barber/${barberId}`);
        return response.data;
    }
};