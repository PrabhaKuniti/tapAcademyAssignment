# Quick Setup Guide

## Prerequisites
1. Install Node.js (v14 or higher) from [nodejs.org](https://nodejs.org/)
2. Install MongoDB:
   - **Windows/Mac**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Or use MongoDB Atlas**: Free cloud database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Installation Steps

### 1. Install All Dependencies

```bash
# From root directory
npm run install-all
```

Or manually:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create `.env` file in `backend` folder:

```bash
cd backend
```

Create a file named `.env` with this content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**For MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system
```

### 3. Start MongoDB (if using local MongoDB)

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 4. Seed Database (Optional)

This creates sample users and attendance data:

```bash
cd backend
npm run seed
```

This creates:
- **Manager**: manager@example.com / password123
- **5 Employees** with sample data

### 5. Run the Application

**Option 1: Run both together**
```bash
# From root directory
npm run dev
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running (check with `mongosh` command)
- Verify MongoDB URI in `.env` file
- For MongoDB Atlas: Check your IP is whitelisted

### Port Already in Use
- Change PORT in backend `.env` file
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  ```

### Module Not Found Errors
- Delete `node_modules` folders
- Run `npm install` again in each directory

## First Time Login

After seeding:
- **Manager**: manager@example.com / password123
- **Employee**: john@example.com / password123

Or register a new account through the Register page.

## Next Steps

1. Login with manager account to see manager dashboard
2. Login with employee account to test check-in/out
3. Explore all features as per the README.md


