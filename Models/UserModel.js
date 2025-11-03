import bcrypt from "bcrypt";
import { queryDB } from "../Utilities/pgPool.js";
import { generateUserToken, insertUserToken } from "../Utilities/token.js";

// ✅ Get all active users
export const getAllUsersHelper = async () => {
  const { rows } = await queryDB(
    "SELECT user_id, user_name, user_email FROM user_info WHERE is_active=true"
  );
  return rows;
};

// ✅ Get profile by ID
export const getProfileHelper = async (userId) => {
  const { rows } = await queryDB(
    "SELECT user_id, user_name, user_email, phone, address, gender FROM user_info WHERE user_id=$1 AND is_active=true",
    [userId]
  );
  if (!rows[0]) throw new Error("User not found");
  return rows[0];
};

// ✅ Sign up a new user
export const signUpHelper = async (name, email, password, phone = null, address = null, gender = null) => {
  const { rows: existing } = await queryDB(
    "SELECT * FROM user_info WHERE user_email=$1",
    [email]
  );
  const existingUser = existing[0];

  if (existingUser) {
    if (!existingUser.is_active) {
      throw new Error("Account is deactivated. Please reactivate your account.");
    } else {
      throw new Error("User already exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await queryDB(
    `INSERT INTO user_info (user_name, user_email, password_hash, phone, address, gender, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING user_id, user_name, user_email`,
    [name, email, hashedPassword, phone, address, gender]
  );

  const user = rows[0];
  const token = generateUserToken(user);
  
  const success = await insertUserToken(user.user_id, token);

  if (!success) {
    await queryDB("DELETE FROM user_info WHERE user_id = $1", [user.user_id]);
    throw new Error("Failed to save login token in db.");
  }

  return { user, token };
};

// ✅ Log in existing user
export const loginHelper = async (email, password) => {
  const { rows } = await queryDB(
    "SELECT * FROM user_info WHERE user_email=$1",
    [email]
  );
  const user = rows[0];

  if (!user) throw new Error("User not found");
  if (!user.is_active) throw new Error("Account is deactivated. Reactivate it.");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateUserToken(user);
  const success = await insertUserToken(user.user_id, token);

  if (!success) {
    throw new Error("Failed to save login token in db.");
  }

  return { user, token };
};

// ✅ Update user name
export const updateUserHelper = async (userId, name) => {
  const { rows } = await queryDB(
    "UPDATE user_info SET user_name=$1 WHERE user_id=$2 AND is_active=true RETURNING user_id, user_name, user_email",
    [name, userId]
  );
  if (!rows[0]) throw new Error("User not found");
  return rows[0];
};

// ✅ Soft delete user
export const deleteUserHelper = async (userId) => {
  const { rows } = await queryDB(
    "UPDATE user_info SET is_active=false WHERE user_id=$1 RETURNING user_id",
    [userId]
  );
  if (!rows[0]) throw new Error("User not found or already deleted");
  return rows[0];
};

// ✅ Reactivate account
export const reactivateAccountHelper = async (name, email, password) => {
  const { rows: existing } = await queryDB(
    "SELECT * FROM user_info WHERE user_email=$1",
    [email]
  );
  const existingUser = existing[0];

  if (!existingUser)
    throw new Error("User not found. Please sign up instead.");
  if (existingUser.is_active)
    throw new Error("Account already active. Please log in.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await queryDB(
    `UPDATE user_info
     SET user_name=$1, password_hash=$2, is_active=true
     WHERE user_email=$3
     RETURNING user_id, user_name, user_email`,
    [name, hashedPassword, email]
  );

  const user = rows[0];
  const token = generateUserToken(user);
  const success = await insertUserToken(user.user_id, token);

  if (!success) {
    throw new Error("Failed to save login token in db.");
  }

  return { user, token };
};
