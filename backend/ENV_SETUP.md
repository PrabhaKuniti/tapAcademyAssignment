# Environment Variables Setup

## Create .env file in the backend directory

Create a file named `.env` in the `backend` directory with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://prabhakuniti_db_user:6SA4l3EZazmRPp8f@cluster0.wqtdjnk.mongodb.net/attendance_system?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Important Notes:

1. **MongoDB Atlas IP Whitelist**: Make sure to whitelist your IP address (or use `0.0.0.0/0` for all IPs) in MongoDB Atlas:
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allows all IPs) or your specific IP
   - Click "Confirm"

2. **For Production (Render)**: You'll need to set these environment variables in Render dashboard:
   - `MONGODB_URI` (same as above)
   - `JWT_SECRET` (generate a new strong random key)
   - `FRONTEND_URL` (your Vercel frontend URL)

