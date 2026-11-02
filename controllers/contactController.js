import contactModel from "../models/contactModel.js";
import transporter from "../config/nodemailer.js";

export const submitContact = async (req, res) => {
    try {
        const { opportunity, name, email, phone, company, message } = req.body;

        if (!opportunity || !name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const newContact = new contactModel({
            opportunity,
            name,
            email,
            phone,
            company,
            message
        });

        await newContact.save();

        const mailToAdmin = {
            from: process.env.SMTP_USER,
            to: 'faceoffmuthu@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                <div style="background-color: #000000; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: #98ac2a; margin: 0; font-size: 24px;">New Contact Submission</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #333;">You have received a new lead from the website contact form.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Opportunity:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #222;">${opportunity}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #222;">${name}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #222;">${email}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #222;">${phone || 'Not provided'}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Company:</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #222;">${company || 'Not provided'}</td></tr>
                    </table>
                    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #98ac2a; border-radius: 4px;">
                        <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.5;"><strong>Message:</strong><br/>${message}</p>
                    </div>
                </div>
            </div>
            `
        };

        const mailToUser = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Thank you for contacting Mentaguide',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                <div style="background-color: #000000; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: #98ac2a; margin: 0; font-size: 24px;">Thank You for Reaching Out!</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">We have successfully received your message regarding <strong>"${opportunity}"</strong>. Our team is currently reviewing your inquiry and will get back to you as soon as possible.</p>
                    
                    <div style="margin-top: 25px; padding: 20px; background-color: #f4f6eb; border-radius: 6px; border: 1px solid #e1e8cc;">
                        <h4 style="margin-top: 0; color: #555;">A copy of your message:</h4>
                        <p style="margin: 0; color: #444; font-style: italic; line-height: 1.5;">"${message}"</p>
                    </div>

                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">Best Regards,<br/><span style="color: #98ac2a; font-weight: bold;">The Mentaguide Team</span></p>
                </div>
            </div>
            `
        };

        // Saving the enquiry is the primary operation. Email is a notification
        // step, so an SMTP outage must not make a saved enquiry look rejected
        // to the visitor (which could lead them to submit it multiple times).
        const emailResults = await Promise.allSettled([
            transporter.sendMail(mailToAdmin),
            transporter.sendMail(mailToUser)
        ]);
        const failedEmails = emailResults.filter(result => result.status === 'rejected');

        if (failedEmails.length) {
            console.error('Contact was saved, but email notification failed:', failedEmails.map(result => result.reason?.message || 'Unknown mail error'));
        }

        return res.status(201).json({
            success: true,
            message: failedEmails.length
                ? 'Your enquiry was received. Email notifications are temporarily unavailable.'
                : 'Contact submitted successfully'
        });

    } catch (error) {
        console.error('Contact form submission failed:', error);
        return res.status(500).json({ success: false, message: 'Unable to submit your enquiry. Please try again later.' });
    }
};
