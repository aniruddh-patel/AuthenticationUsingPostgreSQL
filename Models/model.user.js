import bcrypt from "bcrypt";
import { queryDB } from "../Utilities/pgPool.js";
import { generateToken, insertUserToken } from "../Utilities/token.js";

export const getAllUsersHelper = async () => {
  const { rows } = await queryDB(
    "SELECT id, name, email FROM users WHERE account_deleted=false"
  );
  return rows;
};

export const getProfileHelper = async (userId) => {
  const { rows } = await queryDB(
    "SELECT id, name, email FROM users WHERE id=$1 AND account_deleted=false",
    [userId]
  );
  if (!rows[0]) throw new Error("User not found");
  return rows[0];
};

export const signUpHelper = async (name, email, password) => {
  const { rows: existing } = await queryDB("SELECT * FROM users WHERE email=$1",[email]);
  const existingUser = existing[0];

  if (existingUser) {
    if (existingUser.account_deleted) {
      throw new Error(
        "Account is deactivated. Please reactivate your account."
      );
    } else {
      throw new Error("User already exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await queryDB("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",[name, email, hashedPassword]);

  const user = rows[0];
  const token = generateToken(user);
  const success = await insertUserToken(user.id, token);
   
    if (!success) {
      await queryDB("DELETE FROM users WHERE id = $1", [user.id]);
      throw new Error("Failed to save login token in db.");
    }

  return { user, token };
};

export const loginHelper = async (email, password) => {
  const { rows } = await queryDB("SELECT * FROM users WHERE email=$1", [email]);
  const user = rows[0];

  if (!user) throw new Error("User not found");
  if (user.account_deleted)
    throw new Error("Account is deleted. Reactivate it.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user);
  const success = await insertUserToken(user.id, token);
   
    if (!success) {
      await queryDB("DELETE FROM users WHERE id = $1", [user.id]);
      throw new Error("Failed to save login token in db.");
    }

  return { user, token };
};

export const updateUserHelper = async (userId, name) => {
  const { rows } = await queryDB("UPDATE users SET name=$1 WHERE id=$2 AND account_deleted=false RETURNING id, name, email",[name, userId]);
  if (!rows[0]) throw new Error("User not found");
  return rows[0];
};

export const deleteUserHelper = async (userId) => {
  const { rows } = await queryDB("UPDATE users SET account_deleted=true WHERE id=$1 RETURNING id",[userId]);
  if (!rows[0]) throw new Error("User not found or already deleted");
  return rows[0];
};

export const reactivateAccountHelper = async (name, email, password) => {
  const { rows: existing } = await queryDB("SELECT * FROM users WHERE email=$1",[email]);
  const existingUser = existing[0];

  if (!existingUser) throw new Error("User not found. Please sign up instead.");
  if (!existingUser.account_deleted)
    throw new Error("Account already active. Please log in.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await queryDB(`UPDATE users SET name=$1, password=$2, account_deleted=false WHERE email=$3 RETURNING id, name, email`,[name, hashedPassword, email]);

  const user = rows[0];
  const token = generateToken(user);
  const success = await insertUserToken(user.id, token);
   
    if (!success) {
      await queryDB("DELETE FROM users WHERE id = $1", [user.id]);
      throw new Error("Failed to save login token in db.");
    }

  return { user, token };
};
