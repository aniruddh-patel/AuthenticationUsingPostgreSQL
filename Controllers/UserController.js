import { validateEmail } from "../Utilities/validator.js";
import { validateName } from "../Utilities/validator.js"
import { getAllUsersHelper, getProfileHelper, signUpHelper, loginHelper, updateUserHelper, deleteUserHelper,reactivateAccountHelper} from "../Models/model.user.js";
import { expireToken, deleteAllTokenDB, deleteLogoutToken} from "../Utilities/token.js";

export const getAllHandler = async (req, res) => {
  try {
    const users = await getAllUsersHelper();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const profileHandler = async (req, res) => {
  try {
    const user = await getProfileHelper(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const signUpHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validateEmail(email) || !validateName(name)) {
      return res.status(403).json({ success: false, message: "Invalid name or email" });
    }

    const { user, token } = await signUpHelper(name, email, password);

    res.cookie("token", token, { httpOnly: true, sameSite: "Strict", path: "/", maxAge: 3600000 });
    res.status(201).json({ success: true, message: "User registered", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email)) {
      return res.status(403).json({ success: false, message: "Invalid email" });
    }

    const { token } = await loginHelper(email, password);
    res.cookie("token", token, { httpOnly: true, sameSite: "Strict", path: "/", maxAge: 3600000 });
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const updateHandler = async (req, res) => {
  try {
    const { name } = req.body;
    if (!validateName(name)) {
      return res.status(403).json({ success: false, message: "Invalid name format" });
    }

    const user = await updateUserHelper(req.user.id, name);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHandler = async (req, res) => {
  try {
    await deleteUserHelper(req.user.id);
    await expireToken(res);
    await deleteAllTokenDB(req.user.id)
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logoutHandler = async (req, res) => {
  const token_value=req.cookies.token
  
  try {
    await expireToken(res);
    await deleteLogoutToken(token_value)
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const reactivateAccountHandler = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!validateEmail(email) || !validateName(name)) {
      return res.status(400).json({ success: false, message: "Invalid email or name format" });
    }

    const { user, token } = await reactivateAccountHelper(name, email, password);
    res.cookie("token", token, { httpOnly: true, sameSite: "Strict", path: "/", maxAge: 3600000 });
    res.status(200).json({ success: true, message: "Account reactivated successfully", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
