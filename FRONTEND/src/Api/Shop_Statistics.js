import axios from 'axios';
const Shop_statistics_api = "http://localhost:5000/statistics"

async function GetShopStats(shopid, period) {
    try {
        const response = await axios.get(`${Shop_statistics_api}/${shopid}/overview/${period}`);
        return response.data
    } catch (error) {
        console.error('Error getting the shop stats from server:', error);
        throw error;
    }
}

export { GetShopStats };