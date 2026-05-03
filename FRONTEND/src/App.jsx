import { Routes, Route } from "react-router-dom";
import { UserNav } from './components/UserNav';
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Admin/Dashboard";
import BarberShop from "./Pages/Shop/Barber_Shop";
import Barber from "./Pages/Shop/Barber";
import StaffDetails from "./Pages/Shop/StaffDetails";
import Register from "./Pages/Register";
import Login from "./Pages/Login"
import Test from './Pages/Test'
import ShopStats  from "./Pages/Shop/ShopStats";
import Reservations from "./Pages/Shop/Reservations";
import Request_window from "./components/Request_window";
import axios from "axios";
import User_not_found from "./components/User_not_found";
import { use, useEffect, useState } from "react";

function App() {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return (
    <>
      <User_not_found />
      <UserNav />
      <br />
      <br />
      <Request_window />
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
        <Route path='/test' element={<Test />} />

        <Route path=':barberID/reservations' element={
          <ProtectedRoute allowedRoles={['barber_admin', 'barber']}>
            <Reservations />
          </ProtectedRoute>} />

        <Route
          path="/staff/details"
          element={
            <ProtectedRoute allowedRoles={['barber_admin', 'barber']}>
              <StaffDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shop/statistics"
          element={
            <ProtectedRoute allowedRoles={['barber_admin', 'barber']}>
              <ShopStats />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )

}

export default App
