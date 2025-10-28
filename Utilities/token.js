import jwt from "jsonwebtoken";
import { queryDB } from "./pgPool.js";

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