// import React, { useState } from 'react';
// import { FaUserCircle, FaUser, FaSave } from 'react-icons/fa'; // imported icons
// import '../styles/Profile.css';

// const Profile = () => {
//   const [profile, setProfile] = useState({
//     fullName: 'Rolivhuwa Muzila',
//     email: 'shawty@example.com',
//     phone: '+27 71 234 5678',
//     idNumber: '0000000000000',
//     gender: 'Male',
//     dob: '1998-08-15',
//     address: 'Thohoyandou, Limpopo',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   const handleSave = () => {
//     alert('✅ Profile updated successfully!');
//   };

//   return (
//     <div className="profile-page">
//       <h2>
//         <FaUser style={{ marginRight: '8px' }} />
//         My Profile
//       </h2>

//       <div className="profile-card">
//         <div className="profile-avatar" style={{ fontSize: '6rem', color: '#888' }}>
//           <FaUserCircle />
//         </div>

//         <div className="profile-details">
//           <div className="form-group">
//             <label>Full Name</label>
//             <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} />
//           </div>

//           <div className="form-group">
//             <label>ID Number</label>
//             <input type="text" name="idNumber" value={profile.idNumber} onChange={handleChange} maxLength="13" />
//           </div>

//           <div className="form-group">
//             <label>Gender</label>
//             <select name="gender" value={profile.gender} onChange={handleChange}>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Date of Birth</label>
//             <input type="date" name="dob" value={profile.dob} onChange={handleChange} />
//           </div>

//           <div className="form-group">
//             <label>Phone Number</label>
//             <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
//           </div>

//           <div className="form-group">
//             <label>Email Address</label>
//             <input type="email" name="email" value={profile.email} onChange={handleChange} />
//           </div>

//           <div className="form-group">
//             <label>Address</label>
//             <input type="text" name="address" value={profile.address} onChange={handleChange} />
//           </div>

//           <button className="save-btn" onClick={handleSave}>
//             <FaSave style={{ marginRight: '6px' }} />
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaUser, FaSave } from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setProfile(data.user);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Server error while loading profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('jwt');
    if (!token || !profile?.user_id) return;

    const updateData = {
      // full_name: `${profile.first_name} ${profile.last_name}`,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      id_number: profile.id_number,
      gender: profile.gender,
      dob: profile.dob,
      address: profile.address,
    };

    try {
      const res = await fetch(`http://localhost:3001/api/users/${profile.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('✅ Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Server error while saving profile.');
    }
  };

  if (loading) return <div className="profile-page">Loading profile...</div>;
  if (error) return <div className="profile-page error">{error}</div>;

  return (
    <div className="profile-page">
      <h2>
        <FaUser style={{ marginRight: '8px' }} />
        My Profile
      </h2>

      {message && <div className="success">{message}</div>}
      <div className="profile-card">
        <div className="profile-avatar" style={{ fontSize: '6rem', color: '#888' }}>
          <FaUserCircle />
        </div>

        <div className="profile-details">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value={profile.first_name || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value={profile.last_name || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ID Number</label>
            <input type="text" name="id_number" value={profile.id_number || ''} onChange={handleChange} maxLength="13" />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={profile.gender || ''} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={profile.dob ? profile.dob.split('T')[0] : ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={profile.email || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={profile.address || ''} onChange={handleChange} />
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
