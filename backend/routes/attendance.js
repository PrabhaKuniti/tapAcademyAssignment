const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, employeeOnly, managerOnly } = require('../middleware/auth');
// CSV generation helper
const generateCSV = (data) => {
  if (data.length === 0) return '';
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  // Add rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
};

const router = express.Router();

// Helper function to check if check-in is late (after 9:30 AM)
const isLateCheckIn = (checkInTime) => {
  if (!checkInTime) return false;
  const checkIn = new Date(checkInTime);
  const lateTime = new Date(checkIn);
  lateTime.setHours(9, 30, 0, 0);
  return checkIn > lateTime;
};

// Helper to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   POST /api/attendance/checkin
// @desc    Employee check-in
// @access  Private (Employee)
router.post('/checkin', protect, employeeOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'You have already checked in today' });
    }

    const checkInTime = new Date();
    let status = 'present';

    // Check if late
    if (isLateCheckIn(checkInTime)) {
      status = 'late';
    }

    if (attendance) {
      // Update existing attendance record
      attendance.checkInTime = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkInTime: checkInTime,
        status: status,
      });
    }

    await attendance.populate('userId', 'name email employeeId department');

    res.json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Employee check-out
// @access  Private (Employee)
router.post('/checkout', protect, employeeOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'You have already checked out today' });
    }

    const checkOutTime = new Date();

    // Check if half-day (less than 4 hours)
    const hoursWorked = (checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
    
    if (hoursWorked < 4 && attendance.status !== 'late') {
      attendance.status = 'half-day';
    }

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = attendance.calculateHours();
    await attendance.save();

    await attendance.populate('userId', 'name email employeeId department');

    res.json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get employee's attendance history
// @access  Private (Employee)
router.get('/my-history', protect, employeeOnly, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get employee's monthly summary
// @access  Private (Employee)
router.get('/my-summary', protect, employeeOnly, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const summary = {
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', protect, employeeOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        status: null,
      });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      totalHours: attendance.totalHours,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== MANAGER ROUTES ====================

// @route   GET /api/attendance/all
// @desc    Get all employees' attendance
// @access  Private (Manager)
router.get('/all', protect, managerOnly, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    
    let query = {};

    // Filter by employee
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json([]);
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get attendance for specific employee
// @access  Private (Manager)
router.get('/employee/:id', protect, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let query = { userId: id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', protect, managerOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query).populate('userId', 'department');

    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      departmentWise: {},
    };

    // Department-wise breakdown
    attendance.forEach((a) => {
      const dept = a.userId?.department || 'Unknown';
      if (!summary.departmentWise[dept]) {
        summary.departmentWise[dept] = {
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
        };
      }
      summary.departmentWise[dept][a.status] =
        (summary.departmentWise[dept][a.status] || 0) + 1;
    });

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance as CSV
// @access  Private (Manager)
router.get('/export', protect, managerOnly, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    // Prepare CSV data
    const csvData = attendance.map((a) => ({
      'Employee ID': a.userId?.employeeId || '',
      'Employee Name': a.userId?.name || '',
      'Email': a.userId?.email || '',
      'Department': a.userId?.department || '',
      'Date': a.date.toISOString().split('T')[0],
      'Check In': a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '',
      'Check Out': a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : '',
      'Status': a.status,
      'Total Hours': a.totalHours || 0,
    }));

    // Generate CSV
    const csv = generateCSV(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', protect, managerOnly, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate('userId', 'name email employeeId department');

    const checkedIn = attendance.filter((a) => a.checkInTime);
    const lateArrivals = attendance.filter((a) => a.status === 'late');
    const allUsers = await User.find({ role: 'employee' });
    const checkedInIds = new Set(checkedIn.map((a) => a.userId._id.toString()));
    const absent = allUsers.filter((u) => !checkedInIds.has(u._id.toString()));

    res.json({
      totalEmployees: allUsers.length,
      checkedIn: checkedIn.length,
      present: attendance.filter((a) => a.status === 'present').length,
      late: lateArrivals.length,
      absent: absent.length,
      absentEmployees: absent.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        employeeId: u.employeeId,
        department: u.department,
      })),
      lateArrivals: lateArrivals.map((a) => ({
        _id: a._id,
        user: {
          name: a.userId.name,
          email: a.userId.email,
          employeeId: a.userId.employeeId,
          department: a.userId.department,
        },
        checkInTime: a.checkInTime,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

