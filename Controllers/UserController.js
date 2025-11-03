import { validateEmail, validateName } from "../Utilities/validator.js";
import {
  getProfileHelper,
  signUpHelper,
  loginHelper,
  updateUserHelper,
  deleteUserHelper,
  reactivateAccountHelper,
} from "../Models/UserModel.js";
import {
  expireToken,
  deleteAllTokenDB,
  deleteLogoutToken,
} from "../Utilities/token.js";

// ✅ Get user profile
export const profileHandler = async (req, res) => {
  try {
    const user = await getProfileHelper(req.user.user_id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ✅ Sign up new user
export const signUpHandler = async (req, res) => {
  try {
    const { name, email, password, phone, address, gender } = req.body;

    if (!validateEmail(email) || !validateName(name)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid name or email" });
    }

    const { user, token } = await signUpHelper(
      name,
      email,
      password,
      phone,
      address,
      gender
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 3600000,
    });

    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Login user
export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid email format" });
    }

    const { user, token } = await loginHelper(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// ✅ Update user name
export const updateHandler = async (req, res) => {
  try {
    const { name } = req.body;

    if (!validateName(name)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid name format" });
    }

    const user = await updateUserHelper(req.user.user_id, name);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete (deactivate) user
export const deleteHandler = async (req, res) => {
  try {
    await deleteUserHelper(req.user.user_id);
    await expireToken(res);
    await deleteAllTokenDB(req.user.user_id);

    res
      .status(200)
      .json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Logout user
export const logoutHandler = async (req, res) => {
  const token_value = req.cookies.token;

  try {
    await expireToken(res);
    await deleteLogoutToken(token_value);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ✅ Reactivate deleted account
export const reactivateAccountHandler = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!validateEmail(email) || !validateName(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or name format" });
    }

    const { user, token } = await reactivateAccountHelper(
      name,
      email,
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
      message: "Account reactivated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
