import express from "express";
import { logout, getMe, logInGoogleOAuth } from "../controllers/authController.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/oauth/google", logInGoogleOAuth);
router.get("/logout", logout);

export default router;
