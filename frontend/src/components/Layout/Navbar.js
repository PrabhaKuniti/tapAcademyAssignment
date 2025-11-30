import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>📊 Attendance System</h2>
        </Link>
        <div className="navbar-menu">
          {user?.role === 'employee' && (
            <>
              <Link to="/employee/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/employee/attendance" className="nav-link">
                My Attendance
              </Link>
            </>
          )}
          {user?.role === 'manager' && (
            <>
              <Link to="/manager/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/manager/attendance" className="nav-link">
                Team Attendance
              </Link>
              <Link to="/manager/reports" className="nav-link">
                Reports
              </Link>
            </>
          )}
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
          <div className="nav-user">
            <span>{user?.name}</span>
            <span className="nav-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


