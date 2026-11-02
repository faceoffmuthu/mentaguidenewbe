import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        // Get token from cookies or authorization header
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required: No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Initialize req.body if it doesn't exist
        if (!req.body) {
            req.body = {};
        }

        // Attach user ID to request
        req.body.userId = decoded.id;
        
        // Also attach to req.user for better practice
        req.user = { id: decoded.id };

        // Proceed to the next middleware/route handler
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication"
        });
    }
};

export default userAuth;