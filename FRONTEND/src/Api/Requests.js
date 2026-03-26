import axios from 'axios';
const requests_api = "http://localhost:5000/reservation-request"


async function barberRequests(barberid) {
    try {
        const response = await axios.get(`${requests_api}/barber-requests/${barberid}/`);
        return response.data
    } catch (error) {
        console.error('Error getting data from server:', error);
        throw error;
    }
}

async function sendRequest(payload) {
    try {
        const response = await axios.post(`${requests_api}/`,payload);
        return response.data
    } catch (error) {
        console.error('Error sending the request to server:', error);
        throw error;
    }
}

async function RequestAnswer(requestId,answer) {
    try {
        const response = await axios.put(`${requests_api}/${requestId}`,{status: answer});
        return response.data
    } catch (error) {
        console.error('Error sending the answer request to server:', error);
        throw error;
    }
}

export { barberRequests, sendRequest, RequestAnswer };