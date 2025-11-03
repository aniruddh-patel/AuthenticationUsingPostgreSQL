import jwt from "jsonwebtoken";
import { queryDB } from "./pgPool.js";
import pool from "../Connections/PostgresDB.js";

//  Delete all tokens for a user
export const deleteAllTokenDB = async (userId) => {
  try {
    await queryDB("DELETE FROM user_tokens WHERE user_id = $1", [userId]);
  } catch (err) {
    console.error("deleteAllTokenDB error:", err);
    throw new Error("Failed to delete user tokens");
  }
};

//  Delete a specific token (logout)
export const deleteLogoutToken = async (token) => {
  try {
    await queryDB("DELETE FROM user_tokens WHERE token = $1", [token]);
  } catch (err) {
    console.error("deleteLogoutToken error:", err);
    throw new Error("Failed to delete token");
  }
};

//  Generate JWT token with correct schema fields
export const generateUserToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      account_type:user.account_type
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
export const generateSellerToken = (seller) => {
  return jwt.sign(
    {
      seller_id: seller.seller_id,
      seller_name: seller.seller_name,
      shop_name:seller.shop_name,
      seller_email: seller.seller_email,
      account_type:seller.account_type
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const expireToken = async (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 0,
  });
};


export const insertUserToken = async (userId, token) => {
  const MAX_TOKENS = 2;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT token_id FROM user_tokens WHERE user_id = $1 ORDER BY created_at ASC",
      [userId]
    );

    if (rows.length >= MAX_TOKENS) {
      const oldestId = rows[0].id;
      await client.query("DELETE FROM user_tokens WHERE token_id = $1", [oldestId]);
    }

    await client.query(
      "INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)",
      [userId, token]
    );

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
