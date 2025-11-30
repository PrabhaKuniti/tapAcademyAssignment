const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

dotenv.config();

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

const seedUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP1001',
    department: 'Engineering',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP1002',
    department: 'Marketing',
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP1003',
    department: 'Sales',
  },
  {
    name: 'Alice Williams',
    email: 'alice@example.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP1004',
    department: 'HR',
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP1005',
    department: 'Engineering',
  },
  {
    name: 'Manager One',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'MGR1001',
    department: 'Management',
  },
];

const generateAttendance = async (users) => {
  const attendanceRecords = [];
  const today = new Date();

  // Generate attendance for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const user of users.filter((u) => u.role === 'employee')) {
      // 80% chance of attendance
      if (Math.random() > 0.2) {
        const checkInTime = new Date(date);
        
        // 70% on time (9:00 AM), 20% late (after 9:30 AM), 10% very late (after 10:00 AM)
        const random = Math.random();
        if (random < 0.7) {
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0);
        } else if (random < 0.9) {
          checkInTime.setHours(9, 30 + Math.floor(Math.random() * 30), 0, 0);
        } else {
          checkInTime.setHours(10, Math.floor(Math.random() * 60), 0, 0);
        }

        const checkOutTime = new Date(date);
        // 5% half-day (less than 4 hours), 95% full day
        if (Math.random() < 0.05) {
          checkOutTime.setTime(checkInTime.getTime() + 3.5 * 60 * 60 * 1000);
        } else {
          checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        }

        let status = 'present';
        const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

        // Determine status
        const lateTime = new Date(checkInTime);
        lateTime.setHours(9, 30, 0, 0);
        if (checkInTime > lateTime) {
          status = hoursWorked < 4 ? 'half-day' : 'late';
        } else if (hoursWorked < 4) {
          status = 'half-day';
        }

        const attendance = {
          userId: user._id,
          date: date,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          status: status,
          totalHours: Math.round(hoursWorked * 100) / 100,
        };

        attendanceRecords.push(attendance);
      }
    }
  }

  return attendanceRecords;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert users using create() to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Generate and insert attendance
    const attendanceRecords = await generateAttendance(createdUsers);
    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    console.log('\n📝 Sample Login Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Manager:');
    console.log('  Email: manager@example.com');
    console.log('  Password: password123');
    console.log('\nEmployees:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');
    console.log('  (or any other employee email)');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


