import pool from "../Connections/PostgresDB.js";

////////This is our pool which run ooinly one time by taking queries and data////////
export const queryDB= async(text, params = []) =>{
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error("Database query error:", err.message);
    throw err;
  }
}