import axios from "axios";
const api_link = "http://localhost:5000/user-managment"

async function user_registration(register_data) {
    try {
        const response = await axios.post(`${api_link}/register`, register_data)
        return response.data
    } catch (error) {
        console.error('Error adding user', error);
        throw error;
    }
}

async function login(login_data) {
    try {
        const response = await axios.post(`${api_link}/login`, login_data)
        return response.data
    } catch (error) {
        console.error('Error loging in', error);
        throw error;
    }
}
export { user_registration,login }