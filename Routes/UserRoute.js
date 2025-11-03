import express from "express"
import { logoutHandler, deleteHandler, loginHandler, profileHandler, signUpHandler, updateHandler, reactivateAccountHandler } from "../Controllers/UserController.js";
import {UserAuthToken } from "../Middlewares/tokenValidation.js"

const router = express.Router();

router.post("/account/login",loginHandler);
router.post("/account/signup",signUpHandler);
router.post("/account/reactivate",reactivateAccountHandler);
router.get("/account/profile",UserAuthToken, profileHandler);
router.post("/account/logout",UserAuthToken,logoutHandler)
router.put("/account/update",UserAuthToken, updateHandler);
router.delete("/account/delete",UserAuthToken, deleteHandler);

export default router;


