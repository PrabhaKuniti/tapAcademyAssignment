const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, employeeOnly, managerOnly } = require('../middleware/auth');

const router = express.Router();

// Helper to get day bounds
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper to get month bounds
const getMonthBounds = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard data
// @access  Private (Employee)
router.get('/employee', protect, employeeOnly, async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Today's status
    const { start: todayStart, end: todayEnd } = getDayBounds(today);
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    // Monthly statistics
    const { start: monthStart, end: monthEnd } = getMonthBounds(currentYear, currentMonth);
    const monthlyAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    // Recent 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: todayEnd },
    }).sort({ date: -1 });

    // Calculate statistics
    const monthlyStats = {
      present: monthlyAttendance.filter((a) => a.status === 'present').length,
      absent: monthlyAttendance.filter((a) => a.status === 'absent').length,
      late: monthlyAttendance.filter((a) => a.status === 'late').length,
      halfDay: monthlyAttendance.filter((a) => a.status === 'half-day').length,
      totalHours: monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.json({
      today: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        status: todayAttendance?.status || null,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        totalHours: todayAttendance?.totalHours || 0,
      },
      monthly: monthlyStats,
      recent7Days: recentAttendance.map((a) => ({
        date: a.date,
        status: a.status,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        totalHours: a.totalHours,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard data
// @access  Private (Manager)
router.get('/manager', protect, managerOnly, async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance status
    const { start: todayStart, end: todayEnd } = getDayBounds(today);
    const todayAttendance = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).populate('userId', 'name email employeeId department');

    const allUsers = await User.find({ role: 'employee' });
    const checkedInIds = new Set(todayAttendance.map((a) => a.userId._id.toString()));
    const absentToday = allUsers.filter((u) => !checkedInIds.has(u._id.toString()));

    const todayStats = {
      present: todayAttendance.filter((a) => a.status === 'present').length,
      absent: absentToday.length,
      late: todayAttendance.filter((a) => a.status === 'late').length,
      checkedIn: todayAttendance.filter((a) => a.checkInTime).length,
    };

    // Late arrivals
    const lateArrivals = todayAttendance
      .filter((a) => a.status === 'late')
      .map((a) => ({
        name: a.userId.name,
        employeeId: a.userId.employeeId,
        department: a.userId.department,
        checkInTime: a.checkInTime,
      }));

    // Absent employees
    const absentEmployees = absentToday.map((u) => ({
      name: u.name,
      employeeId: u.employeeId,
      department: u.department,
      email: u.email,
    }));

    // Weekly attendance trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const { start, end } = getDayBounds(date);

      const dayAttendance = await Attendance.find({
        date: { $gte: start, $lte: end },
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
        absent: totalEmployees - dayAttendance.filter((a) => a.status !== 'absent').length,
      });
    }

    // Department-wise attendance for current month
    const { start: monthStart, end: monthEnd } = getMonthBounds(currentYear, currentMonth);
    const monthlyAttendance = await Attendance.find({
      date: { $gte: monthStart, $lte: monthEnd },
    }).populate('userId', 'department');

    const departmentStats = {};
    monthlyAttendance.forEach((a) => {
      const dept = a.userId?.department || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          total: 0,
        };
      }
      departmentStats[dept].total++;
      if (a.status === 'present') departmentStats[dept].present++;
      else if (a.status === 'absent') departmentStats[dept].absent++;
      else if (a.status === 'late') departmentStats[dept].late++;
      else if (a.status === 'half-day') departmentStats[dept].halfDay++;
    });

    res.json({
      totalEmployees,
      today: todayStats,
      lateArrivals,
      absentEmployees,
      weeklyTrend,
      departmentWise: departmentStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


