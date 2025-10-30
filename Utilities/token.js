import jwt from "jsonwebtoken";
import { queryDB } from "./pgPool.js";
import pool from "../Connections/PostgresDB.js";


export const deleteAllTokenDB = async (userId) => {
  try {
    await queryDB("DELETE FROM user_tokens WHERE user_id = $1", [userId]);
  } catch (err) {
    console.error("deleteAllTokenDB error:", err);
    throw new Error("Failed to delete user tokens");
  }
};


export const deleteLogoutToken = async (token) => {
  try {
    await queryDB("DELETE FROM user_tokens WHERE token = $1", [token]);
  } catch (err) {
    console.error("deleteLogoutToken error:", err);
    throw new Error("Failed to delete token");
  }
};

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email },process.env.JWT_SECRET,{ expiresIn: "1h" });
};
export const expireToken =async(res) =>{
  res.cookie("token", "", { httpOnly: true, sameSite: "Strict", path: "/", maxAge: 0 });
}

export const insertUserToken = async (userId, token) => {
  const MAX_TOKENS = 2;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
        const { rows } = await client.query(
        "SELECT id FROM user_tokens WHERE user_id = $1 ORDER BY created_at ASC",
        [userId]
        );

        if (rows.length >= MAX_TOKENS) {
            const oldestId = rows[0].id;
            await client.query("DELETE FROM user_tokens WHERE id = $1", [oldestId]);
        }

        await client.query("INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)",[userId, token]);
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
        console.error("Token insert error:", err);
          return false;
  } finally {
    client.release();
  }
};

