# 🚀 Employee Attendance Management System

A comprehensive role-based employee attendance tracking system built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

## ✨ Features

### 👨‍💻 Employee Features
- ✅ User Registration & Login
- ✅ Daily Check-In / Check-Out
- ✅ Personal Attendance History (Calendar & Table View)
- ✅ Monthly Summary Statistics
- ✅ Employee Dashboard with Quick Actions
- ✅ Profile Management

### 👨‍🏫 Manager Features
- ✅ Manager Dashboard with Team Insights
- ✅ View All Employees' Attendance
- ✅ Filter by Employee, Date, Status
- ✅ Team Calendar View
- ✅ CSV Export Functionality
- ✅ Weekly Attendance Trends
- ✅ Department-wise Statistics
- ✅ Late Arrivals & Absent Employees Tracking

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Recharts** - Data visualization
- **React Calendar** - Calendar component
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📁 Project Structure

```
employee-attendance-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── generateEmployeeId.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.js
│   │   │   │   └── Navbar.css
│   │   │   └── PrivateRoute.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   └── Auth.css
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboard.js
│   │   │   │   ├── EmployeeDashboard.css
│   │   │   │   ├── MyAttendance.js
│   │   │   │   └── MyAttendance.css
│   │   │   ├── manager/
│   │   │   │   ├── ManagerDashboard.js
│   │   │   │   ├── ManagerDashboard.css
│   │   │   │   ├── TeamAttendance.js
│   │   │   │   ├── TeamAttendance.css
│   │   │   │   ├── Reports.js
│   │   │   │   └── Reports.css
│   │   │   ├── Profile.js
│   │   │   └── Profile.css
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── attendanceSlice.js
│   │   │   │   └── dashboardSlice.js
│   │   │   └── store.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Install locally or use MongoDB Atlas
- **npm** or **yarn**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TapAssignment
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

   Or use MongoDB Atlas connection string in `.env`

5. **Seed the database** (Optional)
   ```bash
   cd backend
   npm run seed
   ```

   This will create sample users:
   - **Manager**: manager@example.com / password123
   - **Employees**: john@example.com, jane@example.com, etc. / password123

## 🏃 Running the Project

### Option 1: Run Both Frontend and Backend Together

From the root directory:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000).

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🚀 Deployment

This application is configured for deployment to:
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Summary

1. **Set up MongoDB Atlas** (free tier available)
2. **Deploy backend to Render:**
   - Connect GitHub repository
   - Set environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL)
   - Deploy
3. **Deploy frontend to Vercel:**
   - Connect GitHub repository
   - Set Root Directory to `frontend`
   - Set environment variable: `REACT_APP_API_URL` (your Render backend URL)
   - Deploy
4. **Update backend CORS** with your Vercel frontend URL
5. **Seed the database** with initial data

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "Engineering"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Employee Attendance

#### Check In
```http
POST /api/attendance/checkin
Authorization: Bearer <token>
```

#### Check Out
```http
POST /api/attendance/checkout
Authorization: Bearer <token>
```

#### Get Today's Attendance
```http
GET /api/attendance/today
Authorization: Bearer <token>
```

#### Get My Attendance History
```http
GET /api/attendance/my-history?month=11&year=2024
Authorization: Bearer <token>
```

#### Get My Monthly Summary
```http
GET /api/attendance/my-summary?month=11&year=2024
Authorization: Bearer <token>
```

### Manager Attendance

#### Get All Attendance
```http
GET /api/attendance/all?employeeId=EMP1001&startDate=2024-11-01&endDate=2024-11-30&status=present
Authorization: Bearer <token>
```

#### Get Employee Attendance
```http
GET /api/attendance/employee/:id?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer <token>
```

#### Get Today's Status
```http
GET /api/attendance/today-status
Authorization: Bearer <token>
```

#### Export CSV
```http
GET /api/attendance/export?employeeId=EMP1001&startDate=2024-11-01&endDate=2024-11-30&status=present
Authorization: Bearer <token>
```

### Dashboards

#### Employee Dashboard
```http
GET /api/dashboard/employee
Authorization: Bearer <token>
```

#### Manager Dashboard
```http
GET /api/dashboard/manager
Authorization: Bearer <token>
```

### Users

#### Get All Employees
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "department": "Engineering"
}
```

## 🗄 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'employee', 'manager'),
  employeeId: String (unique),
  department: String,
  createdAt: Date
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (enum: 'present', 'absent', 'late', 'half-day'),
  totalHours: Number,
  createdAt: Date
}
```

## 🎨 Features Overview

### Employee Dashboard
- Today's check-in/check-out status
- Quick action buttons for check-in/out
- Monthly statistics (Present, Absent, Late, Half-day)
- Total hours worked this month
- Recent 7-day attendance log

### Manager Dashboard
- Total employees count
- Today's attendance summary
- Late arrivals list
- Absent employees list
- Weekly attendance trend chart
- Department-wise attendance pie chart

### Attendance History
- Calendar view with color-coded days
- Table view with detailed records
- Month/Year filter
- Monthly summary statistics

### Team Attendance (Manager)
- Filter by employee, date range, status
- Calendar view for team
- Table view with all records
- CSV export functionality

### Reports (Manager)
- Custom date range selection
- Filter by employee
- Summary statistics
- Detailed attendance table
- CSV export

## 📝 Sample Login Credentials

After running the seed script:

**Manager:**
- Email: `manager@example.com`
- Password: `password123`

**Employees:**
- Email: `john@example.com`
- Password: `password123`
- Email: `jane@example.com`
- Password: `password123`
- (And more...)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes middleware
- Input validation with express-validator

## 📦 Available Scripts

### Root
- `npm run dev` - Run both frontend and backend concurrently
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run install-all` - Install all dependencies

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify the `MONGODB_URI` in `.env` file

### Port Already in Use
- Change `PORT` in backend `.env` file
- Or change frontend port by setting `PORT=3001` in frontend

### CORS Error
- Ensure backend is running on port 5000
- Check `cors` middleware is properly configured

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built as part of the TapAssignment project.

---

**Note**: This is a full-stack application with a complete implementation of all required features. Make sure MongoDB is running before starting the backend server.


