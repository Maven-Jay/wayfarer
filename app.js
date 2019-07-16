import dotenv from 'dotenv';
import express from 'express';
import users from './routes/user';
import trip from './routes/trip';
import bookings from './routes/bookings';

dotenv.config();
const app = express();

app.use(express.json());

// handle user auth requsts - sign up and sign in
app.use('/api/v1/auth/', users);

// handle trips requests - create and view trips
app.use('/api/v1/', trip);

// handle bookings requests - create and view bookings
app.use('/api/v1/', bookings);

const PORT = process.env.PORT || 3000;
app.listen(PORT);

module.exports = app;
