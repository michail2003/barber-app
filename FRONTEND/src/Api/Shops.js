import axios from 'axios';
const API_URL = 'http://localhost:5000/userview-shops';
const API_Shop = "http://localhost:5000/manage-barbershop";
const API_Services = "http://localhost:5000/managing-services";

async function getShops() {
    try {
        const response = await axios.get(`${API_URL}`);
        if (response.status !== 200) {
            console.error('Failed to fetch shops, status code:', response.status);
            throw new Error('Failed to fetch shops');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching shops:', error);
        throw error;
    }
}

async function getShop(slug) {
    try {
        const response = await axios.get(`${API_Shop}/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error finding shop:', error);
        throw error;
    }
}

async function addShop(shopData) {
    try {
        const response = await axios.post(`${API_Shop}/addingshop`, shopData);
            return response.data;
       
    } catch (error) {
        console.error('Error adding shop:', error);
        throw error;
    }
}
async function getbarbers(slug) {
    try {
        const response = await axios.get(`${API_Shop}/${slug}/barbers`);
        return response.data;
    } catch (error) {
        console.error('Error fetching barbers:', error);
        throw error;
    }
}

async function getcatalog(id) {
    try {
        const response = await axios.get(`${API_Services}/${id}/services`);
        return response.data;
    } catch (error) {
        console.error('Error fetching shop services:', error);
        throw error;
    }
}
export { getShops,addShop,getShop,getbarbers,getcatalog };