const express = require('express');
const cors = require('cors');
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config();
const app = express();
const server = http.createServer(app)
const port = process.env.PORT || 3000;
const connectDB = require('./config/db');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  const { barberId } = socket.handshake.query
  if (barberId) {
    socket.join(`barber:${barberId}`)
    console.log(`Barber ${barberId} joined their room`)
  }
  socket.on('disconnect', () => {
    console.log(`Barber ${barberId} disconnected`)
  })
})

const shops = require('./routes/shops');
const addbarbershop = require('./routes/managing_barbershops');
const reservation = require('./routes/reservation');
const User = require('./routes/auth');
const feature = require('./routes/A_Barber_features')
const Services = require('./routes/services')
const Request = require('./routes/request');
const Admin = require('./routes/Admin_Managment');
const Barber_Statistics = require('./routes/Barber_Statistics');

connectDB();

app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json());

app.use('/userview-shops', shops);
app.use('/manage-barbershop', addbarbershop);
app.use('/reservations', reservation);
app.use('/user-managment', User);
app.use('/staff-managment', feature);
app.use('/managing-services', Services);
app.use('/reservation-request', Request);
app.use('/admin/managment/', Admin);
app.use('/statistics', Barber_Statistics);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});