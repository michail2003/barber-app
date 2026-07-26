import axios from 'axios';
const base_api = "http://localhost:5000/Maps"

async function shops_hartography(lat,lng) {
    try {
        const response = await axios.get(`${base_api}/nearby-shops/${lat}/${lng}`);
        return response.data
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

export {shops_hartography}