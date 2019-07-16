import express from 'express';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import client from '../db/connection';

const router = express.Router();

// view trip bookings
router.get('/bookings', [
  check('is_admin').isBoolean().equals('true').withMessage('unauthorized access!'),
  check('user_id').isISO8601().withMessage('not a valid date'),
], async (req, res) => {
  const { token } = req.body;
  const e = { message: 'unauthorized access. kindly signup to view trips' };
  try {
    if (!token) throw (e);
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    let user_bookings;

    // if not admin, view all personal bookings
    if (!verified.is_admin) {
      user_bookings = await client.query('SELECT * FROM public.bookings WHERE user_id = $1', [verified.user_id]);
    } else {
      // give admin privilege to view all bookings from database
      user_bookings = await client.query('SELECT * FROM public.bookings');
    }
    res.send({ status: 'success', data: user_bookings.rows });
  } catch (error) {
    res.status(400).send({ status: 'error', error });
  }
});

// delete a booking
router.delete('/bookings/:id', async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;

  const invalid = { message: 'unauthorized request' };
  const deleted = { message: "has previously been deleted or you're not allowed to delete this booking" };

  try {
    if (!token) throw (invalid);
    const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

    if (!user_id) throw (invalid);

    const { rowCount } = await client.query(`DELETE FROM BOOKINGS WHERE (trip_id = ${id} AND user_id =${user_id})`);
    if (rowCount === 0) throw (deleted);
    res.send({ status: 'success', data: { message: `Booking ${id} deleted successfully` } });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err });
  }
});

// users can book a seat on a trip
router.post('/bookings', async (req, res) => {
  const { trip_id, token } = req.body;
  const no_access = { message: 'Access Denied!' };
  const booked_already = { message: 'already booked' };

  try {
    if (!token) throw (no_access);
    const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

    if (!user_id) throw (no_access);

    const { rows } = await client.query(`SELECT trip_id, user_id, booking_id, seat_number FROM BOOKINGS WHERE (TRIP_ID = ${trip_id} OR 
        TRIP_ID = ${trip_id} AND USER_ID = ${user_id} )`);

    const booked_seats = rows.filter(element => element.trip_id === trip_id).length + 1;
    const is_booked = rows.filter(element => element.trip_id === trip_id && element.user_id === user_id).length > 0;

    if (is_booked) throw (booked_already);

    const book = await client.query(`INSERT INTO BOOKINGS (user_id, trip_id, bus_id, trip_date, seat_number, first_name, last_name, email, trip_status)
        SELECT USERS.id AS user_id, TRIPS.trip_id, TRIPS.bus_id, TRIPS.trip_date, ${booked_seats},
        USERS.first_name, USERS.last_name, USERS.email, TRIPS.status as trip_status FROM TRIPS JOIN USERS ON (TRIPS.TRIP_ID = ${trip_id} AND USERS.ID = ${user_id});
        SELECT * FROM BOOKINGS WHERE (TRIP_ID = ${trip_id} AND USER_ID = ${user_id})`);

    res.send({ status: 'success', data: book[1].rows[0] });
  } catch (error) {
    res.status(400).send({ status: 'error', error });
  }
});

module.exports = router;
