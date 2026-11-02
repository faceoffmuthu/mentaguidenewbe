import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";
import contactRoute from "./routes/contactRoutes.js";
import advertiserRoute from "./routes/advertiserRoute.js";
import { isAuthenticated } from "./controllers/authController.js";


const app = express();
const PORT = process.env.PORT || 5000;

const databaseReady = connectDB();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mentaa.netlify.app',
    'https://mentaguide.com',
    'https://mentaguide.vercel.app',
    'https://www.mentaguide.com',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : [])
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin(origin, callback) {
        const isMentaguideVercelDeployment = origin && /^https:\/\/mentaguide(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
        if (!origin || allowedOrigins.includes(origin) || isMentaguideVercelDeployment) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));

app.use(async (req, res, next) => {
    try {
        await databaseReady;
        next();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        res.status(503).json({ success: false, message: 'The service is temporarily unavailable.' });
    }
});

// Api Endpoints
app.get('/', (req, res) => {
    res.send('Say My Name - Heisenburg You goddamn right');
});

app.get('/api/auth/is-auth', isAuthenticated);
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/contact', contactRoute);
app.use('/api/advertiser', advertiserRoute);

if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`You goddamn right http://localhost:${PORT}`);
        console.log(`SMTP user: ${process.env.SMTP_USER || "not configured"}`);
    });
}

// Vercel's Node runtime invokes the exported Express app for each API request.
export default app;
