import express from 'express';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import client from '../db/connection';

const router = express.Router();

const validate_fields = () => [
  check('is_admin').not().isEmpty().isBoolean(), check('bus_id').isAlphanumeric().withMessage('invalid bus id'),
  check('origin').isAlphanumeric().withMessage('invalid address'), check('destination').isAlphanumeric().withMessage('invalid address'),
  check('trip_date').isISO8601().withMessage('not a valid date'), check('fare').isFloat().withMessage('is not a valid amount'),
];

router.get('/trips', async (req, res) => {
  const register = { message: 'kindly sign up to use our services :-)' };

  const { token } = req.body;
  try {
    if (!token) throw (register);
    const { user_id } = jwt.verify(token, process.env.SECRET_KEY);
    if (!user_id) throw (register);

    const get_trips = await client.query('SELECT * FROM public.trips');
    res.send({ status: 'success', data: get_trips.rows });
  } catch (error) {
    res.status(400).send({ status: 'error', error });
  }
});

router.post('/createtrips', validate_fields(), async (req, res) => {
  const no_access = { message: 'Access Denied!' };
  const {
    bus_id, origin, destination, trip_date, fare, token,
  } = req.body;

  if (!token) throw (no_access);
  try {
    validationResult(req).throw();
    const { is_admin } = jwt.verify(token, process.env.SECRET_KEY);
    if (!is_admin) throw (no_access);
  
    const createTrip = await client.query(`INSERT INTO trips (bus_id, origin, destination, trip_date, fare)
     VALUES('${bus_id}', '${origin}', '${destination}', '${trip_date}', '${fare}');

     SELECT * FROM trips WHERE (bus_id = '${bus_id}') ORDER BY trip_id DESC LIMIT 1`);
    const data = createTrip[1].rows[0];
    res.json({ status: 'success', data });
  } catch (error) {
    res.status(400).send({ status: 'error', error });
  }
});

// cancel trip
router.patch('/trips/:trip_id', async (req, res) => {
  const { token } = req.body;
  const no_access = { message: 'Access Denied!' };

  try {
    const { trip_id } = req.params;
    if (!token) throw (no_access);

    const { is_admin } = jwt.verify(token, process.env.SECRET_KEY);
    if (!is_admin) throw (no_access);

    const cancel_trip = await client.query(`UPDATE TRIPS SET STATUS = 'cancelled' WHERE TRIP_ID = ${trip_id};
    UPDATE BOOKINGS SET TRIP_STATUS = 'cancelled' WHERE TRIP_ID = ${trip_id};`);

    if (cancel_trip) res.json({ status: 'success', data: { message: `trip ${trip_id} cancelled successfully` } });
  } catch (err) {
    res.status(400).send({ status: 'error', error: err });
  }
});

module.exports = router;
