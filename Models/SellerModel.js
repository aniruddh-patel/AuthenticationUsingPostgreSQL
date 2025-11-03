import bcrypt from "bcrypt";
import { queryDB } from "../Utilities/pgPool.js";
import { generateSellerToken } from "../Utilities/token.js"; // You can rename insertUserToken → insertSellerToken later if desired
import { generateSellerId } from "../Utilities/idGenerator.js";

// ✅ Get all active sellers
export const getAllSellersHelper = async () => {
  const { rows } = await queryDB(
    "SELECT seller_id, seller_name, seller_email, shop_name FROM seller_info WHERE is_active = true"
  );
  return rows;
};

// ✅ Get seller profile by ID
export const sellerGetProfileHelper = async (sellerId) => {
  const { rows } = await queryDB(
    `SELECT seller_id, seller_name, seller_email, gst_number, shop_name, 
            shop_address, phone_number, verified, is_active, account_type
     FROM seller_info
     WHERE seller_id = $1 AND is_active = true`,
    [sellerId]
  );
  if (!rows[0]) throw new Error("Seller not found");
  return rows[0];
};

// ✅ Register a new seller
export const sellerSignUpHelper = async (
  seller_name,
  seller_email,
  password,
  gst_number,
  shop_name,
  shop_address,
  phone_number
) => {
  const { rows: existing } = await queryDB(
    "SELECT * FROM seller_info WHERE seller_email = $1",
    [seller_email]
  );
  const existingSeller = existing[0];

  if (existingSeller) {
    if (!existingSeller.is_active) {
      throw new Error("Account is deactivated. Please reactivate your account.");
    } else {
      throw new Error("Seller already exists.");
    }
  }

  const seller_id = await generateSellerId();

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await queryDB(
    `INSERT INTO seller_info (
        seller_id, seller_name, seller_email, password_hash, gst_number, 
        shop_name, shop_address, phone_number, verified, is_active, account_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, true, 'seller')
      RETURNING seller_id, seller_name, seller_email, shop_name, gst_number`,
    [
      seller_id,
      seller_name,
      seller_email,
      hashedPassword,
      gst_number,
      shop_name,
      shop_address,
      phone_number,
    ]
  );

  const seller = rows[0];

  const token = generateSellerToken(seller);
  return { seller, token };
};

// ✅ Seller login
export const sellerLoginHelper = async (seller_email, password) => {
  const { rows } = await queryDB(
    "SELECT * FROM seller_info WHERE seller_email = $1",
    [seller_email]
  );
  const seller = rows[0];

  if (!seller) throw new Error("Seller not found");
  if (!seller.is_active) throw new Error("Account is deactivated. Reactivate it.");

  const isMatch = await bcrypt.compare(password, seller.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateSellerToken(seller);
  return { seller, token };
};

// ✅ Update seller info (name, shop name, shop address)
export const sellerUpdateHelper = async (sellerId, seller_name, shop_name, shop_address) => {
  const { rows } = await queryDB(
    `UPDATE seller_info 
     SET seller_name = COALESCE($1, seller_name),
         shop_name = COALESCE($2, shop_name),
         shop_address = COALESCE($3, shop_address)
     WHERE seller_id = $4 AND is_active = true
     RETURNING seller_id, seller_name, shop_name, shop_address, seller_email`,
    [seller_name, shop_name, shop_address, sellerId]
  );

  if (!rows[0]) throw new Error("Seller not found");
  return rows[0];
};

// ✅ Deactivate seller (soft delete)
export const sellerDeleteHelper = async (sellerId) => {
  const { rows } = await queryDB(
    
  "UPDATE seller_info SET is_active = false WHERE seller_id = $1::varchar RETURNING seller_id",
  [sellerId]
);
  if (!rows[0]) throw new Error("Seller not found or already deactivated");
  return rows[0];
};

// ✅ Reactivate seller account
export const sellerReactivateAccountHelper = async (seller_name, seller_email, password) => {
  const { rows: existing } = await queryDB(
    "SELECT * FROM seller_info WHERE seller_email = $1",
    [seller_email]
  );
  const existingSeller = existing[0];

  if (!existingSeller)
    throw new Error("Seller not found. Please sign up instead.");
  if (existingSeller.is_active)
    throw new Error("Account already active. Please log in.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await queryDB(
    `UPDATE seller_info
     SET seller_name = $1, password_hash = $2, is_active = true
     WHERE seller_email = $3
     RETURNING seller_id, seller_name, seller_email`,
    [seller_name, hashedPassword, seller_email]
  );

  const seller = rows[0];
  const token = generateSellerToken(seller);
  return { seller, token };
};




