const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'absent',
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique attendance per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to calculate total hours
attendanceSchema.methods.calculateHours = function () {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals
  }
  return this.totalHours;
};

module.exports = mongoose.model('Attendance', attendanceSchema);


