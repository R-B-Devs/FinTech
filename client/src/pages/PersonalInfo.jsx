import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

const PersonalInfo = () => {
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({
    profileNumber: '1234-5678-9012-3456',
    fullName: 'John Doe',
    saId: '8001015009087',
    gender: 'Male',
    primaryCell: '+27 71 234 5678',
    altCell: '+27 82 345 6789',
    email: 'john.doe@example.com',
    workNumber: '021 123 4567',
    residential: '123 Main St, Johannesburg, Gauteng',
    postal: 'PO Box 456, Sandton, 2196',
    birthCountry: 'South Africa',
    residenceCountry: 'South Africa',
    citizenship: 'South African',
    employmentType: 'Full-Time',
    occupation: 'Software Developer',
    employerIndustry: 'Technology',
    sourceOfFunds: 'Salary'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (section) => {
    setEditSection(section);
  };

  const handleSave = () => {
    alert('Changes saved!');
    setEditSection(null);
  };

  const renderField = (label, name) => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      {editSection ? (
        <input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          style={styles.input}
        />
      ) : (
        <p style={styles.value}>{formData[name]}</p>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Personal Information</h1>
      <p style={styles.description}>
        Manage your personal, contact, citizenship and financial information.
      </p>

      {/* Profile Number */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Profile Number (Bank Card)</h2>
          <Pencil style={styles.icon} onClick={() => handleEdit('profile')} />
        </div>
        {renderField('Bank Card Number', 'profileNumber')}
      </div>

      {/* Personal Details */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Personal Details</h2>
          <Pencil style={styles.icon} onClick={() => handleEdit('personal')} />
        </div>
        {renderField('Full Name', 'fullName')}
        {renderField('SA ID', 'saId')}
        {renderField('Gender', 'gender')}
        {renderField('Primary Cellphone Number', 'primaryCell')}
        {renderField('Alternative Cellphone Number', 'altCell')}
        {renderField('Email Address', 'email')}
        {renderField('Work Number', 'workNumber')}
      </div>

      {/* Address Details */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Address Details</h2>
          <Pencil style={styles.icon} onClick={() => handleEdit('address')} />
        </div>
        {renderField('Residential Address', 'residential')}
        {renderField('Postal Address', 'postal')}
      </div>

      {/* Nationality and Citizenship */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Nationality and Citizenship</h2>
          <Pencil style={styles.icon} onClick={() => handleEdit('citizenship')} />
        </div>
        {renderField('Country of Birth', 'birthCountry')}
        {renderField('Country of Residence', 'residenceCountry')}
        {renderField('Primary Nationality / Citizenship', 'citizenship')}
      </div>

      {/* Employment and Financial Details */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Employment and Financial Details</h2>
          <Pencil style={styles.icon} onClick={() => handleEdit('employment')} />
        </div>
        {renderField('Employment Type', 'employmentType')}
        {renderField('Occupation', 'occupation')}
        {renderField('Employer Industry', 'employerIndustry')}
        {renderField('Source of Funds', 'sourceOfFunds')}
      </div>

      {editSection && (
        <button style={styles.button} onClick={handleSave}>
          Save Changes
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
    color: 'white',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '1rem',
    color: '#ccc',
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2rem',
    backgroundColor: '#111',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #2d2d2d',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  icon: {
    color: '#dc143c',
    cursor: 'pointer',
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #444',
    backgroundColor: '#1f2937',
    color: 'white',
  },
  value: {
    color: '#ccc',
    padding: '0.5rem 0',
  },
  button: {
    backgroundColor: '#dc143c',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};

export default PersonalInfo;
