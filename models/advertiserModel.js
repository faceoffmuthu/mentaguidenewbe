import mongoose from 'mongoose';

const advertiserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    landline: { type: String, default: '' },
    companyName: { type: String, required: true },
    website: { type: String, default: '' },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    
    section2Description: { type: String, default: '' },
    primaryReason: { type: String, required: true },
    specificChallenge: { type: String, required: true },
    
    section3Description: { type: String, default: '' },
    businessDescription: { type: String, required: true },
    businessStage: { type: String, required: true },
    
    section4Description: { type: String, default: '' },
    topicsOfInterest: { type: [String], required: true },
    primaryContact: { type: String, required: true },
    
    section5Description: { type: String, default: '' },
    certificationChallenge: { type: String, required: true },
    expectedOutcome: { type: String, required: true },
    
    section6Description: { type: String, default: '' },
    willAttend: { type: String, required: true },
    numberOfAttendees: { type: Number, required: true },
    additionalComments: { type: String, default: '' }
}, {
    timestamps: true
});

const advertiserModel = mongoose.models.advertiser || mongoose.model('advertiser', advertiserSchema);

export default advertiserModel;
