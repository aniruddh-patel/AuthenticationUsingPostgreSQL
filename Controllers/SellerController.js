import { validateEmail, validateName } from "../Utilities/validator.js";
import {
  sellerGetProfileHelper,
  sellerSignUpHelper,
  sellerLoginHelper,
  sellerUpdateHelper,
  sellerDeleteHelper,
  sellerReactivateAccountHelper,
} from "../Models/SellerModel.js";
import {
  expireToken,
  deleteAllTokenDB,
  deleteLogoutToken,
} from "../Utilities/token.js";


// ✅ Get seller profile
export const sellerProfileHandler = async (req, res) => {
  try {
    const seller = await sellerGetProfileHelper(req.seller.seller_id);
    res.status(200).json({ success: true, seller });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};


// ✅ Seller Sign Up
export const sellerSignUpHandler = async (req, res) => {
  try {
    const {seller_name,seller_email,password,gst_number,shop_name,shop_address,phone_number,} = req.body;
    if (!seller_name ||!seller_email ||!password ||!gst_number ||!shop_name ||!shop_address ||!phone_number
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, GST, shop details, and phone number.",
      });
    }

    if (!validateEmail(seller_email) || !validateName(seller_name)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid name or email format" });
    }

    const { seller, token } = await sellerSignUpHelper(
      seller_name,
      seller_email,
      password,
      gst_number,
      shop_name,
      shop_address,
      phone_number
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 3600000,
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      seller,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// ✅ Seller Login
export const sellerLoginHandler = async (req, res) => {
  try {
    const { seller_email, password } = req.body;

    if (!validateEmail(seller_email)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid email format" });
    }

    const { seller, token } = await sellerLoginHelper(seller_email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      seller: {
        seller_id: seller.seller_id,
        seller_name: seller.seller_name,
        seller_email: seller.seller_email,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};


// ✅ Update seller details
export const sellerUpdateHandler = async (req, res) => {
  try {
    const { seller_name, shop_name, shop_address } = req.body;

    if (seller_name && !validateName(seller_name)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid name format" });
    }

    const seller = await sellerUpdateHelper(
      req.seller.seller_id,
      seller_name,
      shop_name,
      shop_address
    );

    res.status(200).json({ success: true, seller });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// ✅ Deactivate (delete) seller account
export const sellerDeleteHandler = async (req, res) => {
  try {
    await sellerDeleteHelper(req.seller.seller_id);
    await expireToken(res);

    res.status(200).json({
      success: true,
      message: "Seller account deactivated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// ✅ Seller Logout
export const sellerLogoutHandler = async (req, res) => {
  try {
    await expireToken(res);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// ✅ Reactivate Seller Account
export const sellerReactivateAccountHandler = async (req, res) => {
  try {
    const { seller_name, seller_email, password } = req.body;

    if (!validateEmail(seller_email) || !validateName(seller_name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or name format" });
    }

    const { seller, token } = await sellerReactivateAccountHelper(
      seller_name,
      seller_email,
      password
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Seller account reactivated successfully",
      seller,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};




