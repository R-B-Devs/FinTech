import React, { useState } from 'react';
import { FaUserCircle, FaUser, FaSave } from 'react-icons/fa'; // imported icons
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: 'Rolivhuwa Muzila',
    email: 'shawty@example.com',
    phone: '+27 71 234 5678',
    idNumber: '0000000000000',
    gender: 'Male',
    dob: '1998-08-15',
    address: 'Thohoyandou, Limpopo',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = () => {
    alert('✅ Profile updated successfully!');
  };

  return (
    <div className="profile-page">
      <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
        </Link>
      <h2>
        <FaUser style={{ marginRight: '8px' }} />
        My Profile
      </h2>

      <div className="profile-card">
        <div className="profile-avatar" style={{ fontSize: '6rem', color: '#888' }}>
          <FaUserCircle />
        </div>

        <div className="profile-details">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ID Number</label>
            <input type="text" name="idNumber" value={profile.idNumber} onChange={handleChange} maxLength="13" />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={profile.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={profile.dob} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={profile.address} onChange={handleChange} />
          </div>

          <button className="save-btn" onClick={handleSave}>
            <FaSave style={{ marginRight: '6px' }} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
