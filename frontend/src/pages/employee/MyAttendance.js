import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import {
  getMyAttendanceHistory,
  getMySummary,
} from '../../store/slices/attendanceSlice';
import 'react-calendar/dist/Calendar.css';
import './MyAttendance.css';

const MyAttendance = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary, isLoading } = useSelector(
    (state) => state.attendance
  );

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    dispatch(getMyAttendanceHistory({ month: selectedMonth, year: selectedYear }));
    dispatch(getMySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const getStatusColor = (status) => {
    const colors = {
      present: '#10b981',
      absent: '#ef4444',
      late: '#f59e0b',
      'half-day': '#f97316',
    };
    return colors[status] || '#6b7280';
  };

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return myHistory.find((record) => {
      const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
      return recordDate === dateStr;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const attendance = getAttendanceForDate(date);
      if (attendance) {
        return `calendar-day calendar-${attendance.status}`;
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const attendance = getAttendanceForDate(date);
      if (attendance) {
        return (
          <div
            className="calendar-dot"
            style={{ backgroundColor: getStatusColor(attendance.status) }}
          />
        );
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const attendance = getAttendanceForDate(date);
    if (attendance) {
      // Show details modal or navigate to detail page
      console.log('Selected attendance:', attendance);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: <span className="badge badge-success">Present</span>,
      absent: <span className="badge badge-danger">Absent</span>,
      late: <span className="badge badge-warning">Late</span>,
      'half-day': <span className="badge badge-info">Half Day</span>,
    };
    return badges[status] || null;
  };

  const filteredHistory = myHistory.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() + 1 === selectedMonth &&
      recordDate.getFullYear() === selectedYear
    );
  });

  if (isLoading) {
    return <div className="loading">Loading attendance history...</div>;
  }

  return (
    <div className="container">
      <h1>My Attendance History</h1>

      {/* Month/Year Selector */}
      <div className="card">
        <div className="filter-controls">
          <div className="form-group">
            <label>Month</label>
            <select
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <select
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="form-group">
            <label>View Mode</label>
            <div className="view-toggle">
              <button
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
              <button
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      {mySummary && (
        <div className="grid grid-4">
          <div className="card stat-card">
            <h3>Present</h3>
            <p className="stat-value text-success">{mySummary.present}</p>
          </div>
          <div className="card stat-card">
            <h3>Absent</h3>
            <p className="stat-value text-danger">{mySummary.absent}</p>
          </div>
          <div className="card stat-card">
            <h3>Late</h3>
            <p className="stat-value text-warning">{mySummary.late}</p>
          </div>
          <div className="card stat-card">
            <h3>Half Day</h3>
            <p className="stat-value text-primary">{mySummary.halfDay}</p>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          <h2>Calendar View</h2>
          <div className="calendar-wrapper">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
              onClickDay={handleDateClick}
            />
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
              <span>Present</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Late</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f97316' }}></div>
              <span>Half Day</span>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card">
          <h2>Table View</h2>
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record, index) => (
                      <tr key={index}>
                        <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>
                          {record.checkInTime
                            ? format(new Date(record.checkInTime), 'hh:mm a')
                            : '-'}
                        </td>
                        <td>
                          {record.checkOutTime
                            ? format(new Date(record.checkOutTime), 'hh:mm a')
                            : '-'}
                        </td>
                        <td>{record.totalHours || 0} hrs</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No attendance records found for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;


