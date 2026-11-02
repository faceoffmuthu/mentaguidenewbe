import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const hassedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hassedPassword
        })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        // Sending email Welcome
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Meta Guide',
            text: `Thank you for registering ${email}`
        }

        await transporter.sendMail(mailOptions);


        return res.status(200).json({ success: true, message: "Register successful", token });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, message: "Login successful", token });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        return res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Send Verficication Otp to the user's email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "User already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpiryAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your email',
            // text: `Your verification OTP is ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Verification OTP sent successfully" });

    } catch (error) {
        console.error('Send verification OTP error:', error);

        if (error.code || error.command || error.responseCode) {
            return res.status(502).json({
                success: false,
                message: "Unable to send verification email. Check SMTP credentials and sender settings."
            });
        }

        return res.status(500).json({ success: false, message: error.message });
    }

}

// Verify the email using the otp
export const verifyEmail = async (req, res) => {

    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpiryAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiryAt = 0;

        await user.save();
        return res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }


}

// Check if user is Authenticated
export const isAuthenticated = async (req, res) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.json({ success: false, message: "Not authenticated" });
        }

        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ success: true, message: "User is authenticated" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Send Password Reset Otp to the user's email
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpiryAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset your password using this OTP',
            // text: `Your reset OTP is ${otp} Use this OTP to reset your password`,
            html: PASSWORD_RESET_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Reset OTP sent successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }
}

// Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpiryAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Reset User Password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "Email, OTP and Password are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpiryAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        const hassedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hassedPassword;
        user.resetOtp = '';
        user.resetOtpExpiryAt = 0;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }
}

