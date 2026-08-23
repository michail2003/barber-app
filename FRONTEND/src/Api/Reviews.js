import axios from "axios";
const Api = 'http://localhost:5000/Shop-Reviews'

async function getShopReviews(shopID) {
    try {
        const response = await axios.get(`${Api}/${shopID}?placeId='ChIJbUayoBoxUBMReENvlBOcaPg'`);
        return response.data;
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

async function postShopReview(shopID, reviewData) {
    try {
        const response = await axios.post(`${Api}/post-review/${shopID}`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Error posting review to server:', error);
        throw error;
    }
}

export { getShopReviews, postShopReview };