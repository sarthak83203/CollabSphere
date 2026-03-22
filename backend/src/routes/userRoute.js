import { Router } from "express";
import express from "express"
import { login, register } from "../controllers/usercontroler.js";
const router=express.Router();
//other way to write this...
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity");
router.route("/get_all_activity");

export default router;

