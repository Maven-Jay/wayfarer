import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  server: process.env.IP || '127.0.0.1',
  database: process.env.DATABASE,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
client.connect();
module.exports = client;
