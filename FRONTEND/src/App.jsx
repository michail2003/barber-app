import { Routes, Route } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { UserNav } from './components/UserNav';
import Home from "./Pages/Home";
import Dashboard from "./Pages/Admin/Dashboard";
import BarberShop from "./Pages/Shop/Barber_Shop";
import Barber from "./Pages/Shop/Barber";
import Register from "./Pages/Register";
import Login from "./Pages/Login"
function App() {

  return (
    <>
    <UserNav/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/admin/dashboard' element={<Dashboard />} />
        <Route path='/:slug' element={<BarberShop />} />
        <Route path='/:slug/barber' element={<Barber />} />
        <Route path='/register/user' element={<Register />} />
        <Route path='/login/user' element={<Login />} />
      </Routes>
    </>
  )
}

export default App
