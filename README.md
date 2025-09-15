# SkillBench OTP Backend

Node.js + Express backend for handling OTP authentication using 2Factor.in API.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend-example
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` and add your 2Factor.in API key:
```env
TWOFACTOR_API_KEY=your-2factor-api-key-here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Get API Key (Legacy)
```
GET /otpget
Response: { "key": "your-api-key" }
```

### Send OTP
```
POST /send-otp
Content-Type: application/json

Body:
{
  "phone": "9876543210"
}

Success Response:
{
  "success": true,
  "sessionId": "session-id-from-2factor",
  "message": "OTP sent successfully to your phone number.",
  "phone": "+919876543210"
}

Error Response:
{
  "success": false,
  "error": "Invalid phone number format. Please enter a valid 10-digit number."
}
```

### Verify OTP
```
POST /verify-otp
Content-Type: application/json

Body:
{
  "sessionId": "session-id-from-send-otp",
  "otp": "123456"
}

Success Response:
{
  "success": true,
  "message": "OTP verified successfully."
}

Error Response:
{
  "success": false,
  "error": "Invalid OTP code. Please check the code and try again."
}
```

### Legacy Endpoints
- `POST /sendotp` - Same as `/send-otp`
- `POST /verifyotp` - Same as `/verify-otp`

## 🛡️ Error Handling

The backend handles various error scenarios:

- **Invalid phone numbers** - Format validation
- **DND numbers** - Do Not Disturb detection
- **Rate limiting** - Too many requests
- **Network errors** - Connection issues
- **API errors** - 2Factor.in service issues

## 🔧 Configuration

### Environment Variables
- `TWOFACTOR_API_KEY` - Your 2Factor.in API key (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

### CORS Setup
The server is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)

Add your frontend URL to `ALLOWED_ORIGINS` in `.env`.

## 📁 Project Structure

```
backend-example/
├── routes/
│   └── otp.js              # OTP API routes
├── services/
│   └── OTPService.js       # 2Factor.in integration
├── middleware/
│   └── errorHandler.js     # Error handling
├── server.js               # Express app setup
├── package.json
├── .env.example
└── README.md
```

## 🔄 Integration with Frontend

Update your React app's `.env`:
```env
VITE_BACKEND_URL=http://localhost:3001
# Remove the test mode flag
# VITE_FORCE_TEST_MODE=true
```

Your React OTPService will automatically use these backend endpoints.

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Check `ALLOWED_ORIGINS` in `.env`
2. **API key errors**: Verify `TWOFACTOR_API_KEY` is set correctly
3. **Port conflicts**: Change `PORT` in `.env` if 3001 is occupied
4. **Network errors**: Check internet connection and firewall settings

### Logs
The server logs all requests and errors to console. Check terminal for debugging info.

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin request protection
- **Request validation** - Input sanitization
- **Error sanitization** - No sensitive data exposure
- **Rate limiting** - Built into 2Factor.in API