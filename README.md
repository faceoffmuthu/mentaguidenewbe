# MERN Authentication Backend

A robust authentication system built with Node.js, Express, and MongoDB. This backend provides JWT-based authentication, email verification, and password reset functionality.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with SMTP
- **Security**: bcryptjs, cookie-parser, CORS
- **Environment**: dotenv
- **Development**: Nodemon

## 📁 Project Structure

```
server/
├── config/
│   ├── mongodb.js      # MongoDB connection setup
│   └── nodemailer.js   # Email configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── userController.js  # User-related operations
├── middleware/
│   └── userAuth.js     # Authentication middleware
├── models/
│   └── userModel.js    # User schema and model
├── routes/
│   ├── authRoutes.js   # Authentication routes
│   └── userRoutes.js   # User routes
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json
└── server.js           # Application entry point
```

## 🔑 Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (SMTP)
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_sender_email@example.com

# Client URL for CORS
CLIENT_URL=http://localhost:3000
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mern-auth.git
   cd mern-auth/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production**
   ```bash
   npm install --production
   npm start
   ```

## 📦 Package Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (configure your test scripts here)

## 📚 API Endpoints

### Authentication

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword123"
  }
  ```

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword123"
  }
  ```

#### Verify Email
- **URL**: `/api/auth/verify-email`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "otp": "123456"
  }
  ```

#### Reset Password
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "otp": "123456",
    "newPassword": "newsecurepassword123"
  }
  ```

### User

#### Get User Data
- **URL**: `/api/user/data`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

## 🔒 Authentication Flow

1. User registers with email and password
2. Server creates user and sends verification email with OTP
3. User verifies email using OTP
4. User logs in with credentials
5. Server returns JWT token in HTTP-only cookie
6. Token is verified on protected routes

## 📧 Email Setup

This project uses Nodemailer with SMTP. To set up email functionality:

1. Update SMTP settings in `.env`
2. Configure your email provider (Gmail, Brevo, etc.)
3. Test email sending during development

Example email configuration in `config/nodemailer.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

## 🐳 Docker Support

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **JWT Errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check spam folder
   - Test with different email provider

## 📝 Changelog

### [1.0.0] - YYYY-MM-DD
- Initial release with authentication and user management

## 🔒 Security Best Practices

- Use HTTPS in production
- Set secure and httpOnly flags for cookies
- Implement rate limiting
- Use environment variables for sensitive data
- Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/about/)
