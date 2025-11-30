import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import apiClient from '../config/api';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    employeeId: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.put('/api/users/profile', {
        name: formData.name,
        department: formData.department,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Update user in store by getting current user again
      window.location.reload(); // Simple refresh to reload user data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>My Profile</h1>
      <div className="card profile-card">
        <div className="profile-header">
          <h2>Personal Information</h2>
          {!isEditing && (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              disabled
            />
            <small className="form-text">Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              className="form-control"
              value={formData.employeeId}
              disabled
            />
            <small className="form-text">Employee ID cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              className="form-control"
              value={formData.department}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="role"
              className="form-control"
              value={formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ''}
              disabled
            />
            <small className="form-text">Role cannot be changed</small>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      department: user.department || '',
                      employeeId: user.employeeId || '',
                      role: user.role || '',
                    });
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;


