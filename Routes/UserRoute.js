import express from "express"
import { logoutHandler, deleteHandler, getAllHandler, loginHandler, profileHandler, signUpHandler, updateHandler, reactivateAccountHandler } from "../Controllers/UserController.js";
import {authenticateToken } from "../Middlewares/tokenValidation.js"

const router = express.Router();

router.get("/users",authenticateToken, getAllHandler);
router.get("/user/profile/",authenticateToken, profileHandler);

router.post("/user/login",loginHandler);
router.post("/user/signup",signUpHandler);
router.post("/user/reactivate",reactivateAccountHandler);
router.post("/user/logout",authenticateToken,logoutHandler)
router.put("/user/update/",authenticateToken, updateHandler);
router.delete("/user/account/",authenticateToken, deleteHandler);

export default router;


