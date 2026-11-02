import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpiryAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpiryAt: { type: Number, default: 0 },
})

// model
// mongoose.models.user is used to check if the model already exists then it will use the model
const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
