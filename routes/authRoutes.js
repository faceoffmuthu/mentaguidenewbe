import express from "express";
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail, verifyResetOtp } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRoute.post('/verify-account', userAuth, verifyEmail);
authRoute.get('/is-auth', isAuthenticated);
authRoute.post('/send-reset-otp', sendResetOtp);
authRoute.post('/verify-reset-otp', verifyResetOtp);
authRoute.post('/reset-password', resetPassword);

export default authRoute;
