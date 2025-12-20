import { Routes, Route } from "react-router-dom";
import { UserNav } from './components/UserNav';
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Admin/Dashboard";
import BarberShop from "./Pages/Shop/Barber_Shop";
import Barber from "./Pages/Shop/Barber";
import Register from "./Pages/Register";
import Login from "./Pages/Login"
import Reservations from "./Pages/Shop/Reservations";
import StaffDetails from "./Pages/Shop/StaffDetails"
import axios from "axios";

function App() {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return (
    <>
      <UserNav />
      <Routes>

        <Route path='/' element={<Home />} />

        <Route path='/admin/dashboard' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
        />

        <Route path='/:slug' element={<BarberShop />} />
        <Route path='/:slug/barber' element={<ProtectedRoute allowedRoles={['barber_admin', 'admin']}>
          <Barber />
        </ProtectedRoute>} />

        <Route path='/register/user' element={<Register />} />
        <Route path='/login/user' element={<Login />} />

        <Route path=':barberID/reservations' element={
          <ProtectedRoute allowedRoles={['barber_admin', 'barber']}>
            <Reservations />
          </ProtectedRoute>} />

        <Route
          path="/staff/details"
          element={
            <ProtectedRoute allowedRoles={['barber_admin']}>
              <StaffDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
