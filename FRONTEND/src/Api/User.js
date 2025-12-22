import axios from "axios";
import { jwtDecode } from 'jwt-decode';

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
        const response = await axios.post(`${api_link}/login`, login_data);
        const token = response.data.token;
        const decoded = jwtDecode(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        localStorage.setItem('name', decoded.name);
        localStorage.setItem('number',decoded.numer);
        localStorage.setItem('id',decoded.id)
        localStorage.setItem('role',decoded.role)
        localStorage.setItem('shop',decoded.shop)

        return response.data;
    } catch (error) {
        console.error('Error logging in', error);
        throw error;
    }
}
export { user_registration, login }