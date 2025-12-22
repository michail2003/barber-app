const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shops = require('./routes/shops');
const addbarbershop = require('./routes/managing_barbershops');
const reservation = require('./routes/reservation');
const User = require('./routes/auth');
const feature = require('./routes/A_Barber_features')

const connectDB = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;

connectDB();
// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.use('/userview-shops', shops);
app.use('/manage-barbershop', addbarbershop);
app.use('/reservations', reservation);
app.use('/user-managment',User)
app.use('/staff-managment',feature)
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});