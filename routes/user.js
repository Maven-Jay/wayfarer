import dotenv from 'dotenv';
import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import client from '../db/connection';

dotenv.config();
const router = express.Router();

router.post('/signup', [
  check('email').isEmail().withMessage('not a valid email address'),
  check('password').isLength({ min: 5 }).withMessage('password should be more than 4 characters long'),
  check('first_name').isAlpha().withMessage('not a name'),
  check('last_name').isAlpha().withMessage('not a name')], async (req, res) => {
  const {
    email, first_name, last_name, password,
  } = req.body;
  try {
    validationResult(req).throw();

    // search if emial has previously registered
    const search = await client.query('SELECT * FROM users WHERE email =$1', [email]);
    const e = { message: 'a user has already signed up with this email' };

    if (search.rowCount > 0) throw (e);
    // hash password
    const hash = await bcrypt.hash(password, 10);
    const insert = await client.query(`INSERT INTO public.users (email, first_name, last_name, password) 
      VALUES('${email}', '${first_name}', '${last_name}', '${hash}');
  
      SELECT id as user_id, is_admin FROM public.users WHERE email = '${email}' LIMIT 1`);
    const { user_id, is_admin } = insert[1].rows[0];
    const token = await jwt.sign({ user_id, is_admin }, process.env.SECRET_KEY);
    res.send({ status: 'success', data: { user_id, is_admin, token }, message: 'successfully registered' });
  } catch (error) {
    res.send({ status: 'error', error });
  }
});

router.post('/signin', [check('email').isEmail(), check('password').isLength({ min: 5 })], async (req, res) => {
  try {
    const notfound = { message: 'email not found. kindly input your registered email' };
    const unverified = { message: 'incorrect password' };
    const { email, password } = req.body;

    // validate user request fields
    validationResult(req).throw();
    // search for user email in database
    const result = await client.query('SELECT id, password as hash_password, is_admin FROM public.users WHERE email = $1 limit 1', [email]);

    if (result.rows.length < 1) throw (notfound);

    const { id, hash_password, is_admin } = result.rows[0];
    const hash = await bcrypt.compare(password, hash_password);

    // if passwords match then log user in
    if (!hash) throw (unverified);
    const token = jwt.sign({ user_id: id, is_admin }, process.env.SECRET_KEY);
    res.json({ status: 'success', data: { user_id: id, is_admin, token }, message: 'successfully logged in' });
  } catch (error) {
    res.status(400).send({ status: 'error', error });
  }
});

module.exports = router;
