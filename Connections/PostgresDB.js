import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './Configuration/.env' }); 

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  max: 10,                 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});
pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('PostgreSQL pool error', err));

export default pool;

