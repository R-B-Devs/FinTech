import React, { useState } from 'react';
import { Pencil, Save, X, Check } from 'lucide-react';

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

  const [tempData, setTempData] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (section) => {
    setEditSection(section);
    // Initialize temp data with current form data for the section
    const sectionFields = getSectionFields(section);
    const initialData = {};
    sectionFields.forEach(field => {
      initialData[field.name] = formData[field.name];
    });
    setTempData(initialData);
    setSaveStatus('');
  };

  const handleSave = () => {
    // Update form data with temp data
    setFormData(prev => ({ ...prev, ...tempData }));
    setSaveStatus('saved');
    setEditSection(null);
    setTempData({});
    
    // Clear save status after 2 seconds
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleCancel = () => {
    setEditSection(null);
    setTempData({});
    setSaveStatus('');
  };

  const getSectionFields = (section) => {
    switch (section) {
      case 'profile':
        return [{ label: 'Bank Card Number', name: 'profileNumber' }];
      case 'personal':
        return [
          { label: 'Full Name', name: 'fullName' },
          { label: 'SA ID', name: 'saId' },
          { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
          { label: 'Primary Cellphone Number', name: 'primaryCell' },
          { label: 'Alternative Cellphone Number', name: 'altCell' },
          { label: 'Email Address', name: 'email', type: 'email' },
          { label: 'Work Number', name: 'workNumber' }
        ];
      case 'address':
        return [
          { label: 'Residential Address', name: 'residential' },
          { label: 'Postal Address', name: 'postal' }
        ];
      case 'citizenship':
        return [
          { label: 'Country of Birth', name: 'birthCountry' },
          { label: 'Country of Residence', name: 'residenceCountry' },
          { label: 'Primary Nationality / Citizenship', name: 'citizenship' }
        ];
      case 'employment':
        return [
          { label: 'Employment Type', name: 'employmentType', type: 'select', options: ['Full-Time', 'Part-Time', 'Contract', 'Self-Employed', 'Unemployed'] },
          { label: 'Occupation', name: 'occupation' },
          { label: 'Employer Industry', name: 'employerIndustry' },
          { label: 'Source of Funds', name: 'sourceOfFunds' }
        ];
      default:
        return [];
    }
  };

  const renderField = (field) => {
    const isEditing = editSection && getSectionFields(editSection).some(f => f.name === field.name);
    const currentValue = isEditing ? (tempData[field.name] || formData[field.name]) : formData[field.name];

    return (
      <div key={field.name} style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        {isEditing ? (
          field.type === 'select' ? (
            <select
              name={field.name}
              value={currentValue}
              onChange={handleChange}
              style={styles.select}
            >
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={currentValue}
              onChange={handleChange}
              style={styles.input}
              placeholder={field.label}
            />
          )
        ) : (
          <p style={styles.value}>{currentValue}</p>
        )}
      </div>
    );
  };

  const renderSection = (sectionKey, title) => {
    const fields = getSectionFields(sectionKey);
    const isEditing = editSection === sectionKey;

    return (
      <div key={sectionKey} style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <div style={styles.buttonGroup}>
            {isEditing ? (
              <>
                <button style={styles.saveButton} onClick={handleSave}>
                  <Save size={16} />
                  Save
                </button>
                <button style={styles.cancelButton} onClick={handleCancel}>
                  <X size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button style={styles.editButton} onClick={() => handleEdit(sectionKey)}>
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>
        </div>
        <div style={styles.fieldContainer}>
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Personal Information</h1>
        <p style={styles.description}>
          Manage your personal, contact, citizenship and financial information.
        </p>
        {saveStatus === 'saved' && (
          <div style={styles.successMessage}>
            <Check size={16} />
            Changes saved successfully!
          </div>
        )}
      </div>

      <div style={styles.sectionsContainer}>
        {renderSection('profile', 'Profile Number (Bank Card)')}
        {renderSection('personal', 'Personal Details')}
        {renderSection('address', 'Address Details')}
        {renderSection('citizenship', 'Nationality and Citizenship')}
        {renderSection('employment', 'Employment and Financial Details')}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #000000 100%)',
    color: 'white',
    padding: '1.5rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #dc143c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  description: {
    fontSize: '1.1rem',
    color: '#a0a0a0',
    marginBottom: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#0f5132',
    color: '#d1e7dd',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    marginTop: '1rem',
    border: '1px solid #0a3622',
    animation: 'slideIn 0.3s ease-out',
  },
  sectionsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '1.5rem',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #dc143c',
    color: '#dc143c',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#dc143c',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #6b7280',
    color: '#6b7280',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  fieldContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  fieldGroup: {
    marginBottom: '0.5rem',
  },
  label: {
    display: 'block',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#e5e7eb',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
  },
  value: {
    color: '#d1d5db',
    padding: '0.75rem 0',
    fontSize: '0.95rem',
    minHeight: '1.5rem',
    lineHeight: '1.5',
  },
};

export default PersonalInfo;