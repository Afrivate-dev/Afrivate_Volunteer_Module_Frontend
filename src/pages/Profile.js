import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profile, getRole } from '../services/api';
import { buildPathfinderBaseDetails } from '../utils/pathfinderProfilePayload';

const defaultFormData = {
  firstName: 'Amina',
  lastName: 'Okonkwo',
  email: '',
  phone: '+234 800 000 0000',
  dateOfBirth: '1995-05-15',
  nationality: 'Nigeria',
  address: '',
  city: 'Lagos',
  state: 'Lagos',
  zipCode: '',
  country: 'Nigeria',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  language: 'English',
  timezone: 'UTC+1',
  currency: 'NGN',
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const role = getRole();
        let profileData;
        
        if (role === 'enabler') {
          profileData = await profile.enablerGet();
        } else {
          profileData = await profile.pathfinderGet();
        }
        
        if (profileData) {
          const base = profileData.base_details || {};
          setFormData((prev) => ({
            ...prev,
            firstName: profileData.first_name || profileData.name || prev.firstName,
            lastName: profileData.last_name || prev.lastName,
            email: base.contact_email || prev.email,
            phone: base.phone_number || prev.phone,
            address: base.address || prev.address,
            city: base.city || prev.city,
            state: base.state || prev.state,
            country: base.country || prev.country,
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (activeTab === 'personal') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }
    
    if (activeTab === 'address') {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }
    
    if (activeTab === 'security' && (formData.currentPassword || formData.newPassword || formData.confirmPassword)) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const role = getRole();
        if (role === 'enabler') {
          const profileData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            base_details: {
              contact_email: formData.email,
              phone_number: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              country: formData.country,
            },
          };
          await profile.enablerPatch(profileData);
        } else {
          const addressLine = [formData.address, formData.city]
            .filter(Boolean)
            .join(', ')
            .trim();
          await profile.pathfinderPatch({
            first_name: String(formData.firstName || '').trim(),
            last_name: String(formData.lastName || '').trim(),
            base_details: buildPathfinderBaseDetails({
              bio: '',
              contact_email: formData.email,
              phone_number: formData.phone,
              address: addressLine || String(formData.address || '').trim(),
              state: formData.state,
              country: formData.country,
              website: '',
            }),
          });
        }
      } catch (err) {
        console.error('Error saving profile:', err);
      }
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nationality</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Street Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`input-field ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`input-field ${errors.city ? 'border-red-500' : ''}`}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State/Province</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`input-field ${errors.state ? 'border-red-500' : ''}`}
            />
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
            />
            {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`input-field ${errors.country ? 'border-red-500' : ''}`}
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`input-field ${errors.currentPassword ? 'border-red-500' : ''}`}
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`input-field ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive important updates via email</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-600">Receive important updates via SMS</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="UTC+1">West Africa Time (UTC+1)</option>
            <option value="UTC+3">East Africa Time (UTC+3)</option>
            <option value="UTC+0">UTC</option>
            <option value="UTC-5">Eastern Time (UTC-5)</option>
            <option value="UTC-6">Central Time (UTC-6)</option>
            <option value="UTC-7">Mountain Time (UTC-7)</option>
            <option value="UTC-8">Pacific Time (UTC-8)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'address':
        return renderAddressInfo();
      case 'security':
        return renderSecuritySettings();
      case 'preferences':
        return renderPreferences();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Profile Tabs">
              {[
                { id: 'personal', name: 'Personal Info', icon: '👤' },
                { id: 'address', name: 'Address', icon: '📍' },
                { id: 'security', name: 'Security', icon: '🔒' },
                { id: 'preferences', name: 'Preferences', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span className="mr-2" aria-hidden="true">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {renderCurrentTab()}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link
                  to="/dashboard"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Back to Dashboard
                </Link>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 