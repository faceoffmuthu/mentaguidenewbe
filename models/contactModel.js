import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    opportunity: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    company: { type: String, required: false },
    message: { type: String, required: true }
}, { timestamps: true });

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema);

export default contactModel;
