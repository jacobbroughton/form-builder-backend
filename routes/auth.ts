import express from "express";
import { logout, getMe, logInGoogleOAuth } from "../controllers/authController.js";
import { validateSession } from "../middleware/validateSession.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/oauth/google", logInGoogleOAuth);
router.get("/logout", validateSession, logout);

export default router;
