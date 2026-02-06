import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';

const KYCForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    nationality: 'NIGERIAN',
    gender: '',
    stateOfResidence: '',

    // Contact Information
    phone: '',
    email: '',
    socialMedia: {
      google: false,
      facebook: false,
      twitter: false
    },

    // Identity Verification
    idType: '',
    proofOfAddress: null,

    // Education & Experience
    highestQualification: '',
    fieldOfStudy: '',
    employmentStatus: '',
    yearsOfExperience: '',

    // Payment Information
    bankName: '',
    accountNumber: '',
    bvn: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.stateOfResidence) newErrors.stateOfResidence = 'State of residence is required';
        break;
      
      case 2: // Contact Information
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        break;
      
      case 3: // Identity Verification
        if (!formData.idType) newErrors.idType = 'ID type is required';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
        break;
      
      case 4: // Education & Experience
        if (!formData.highestQualification) newErrors.highestQualification = 'Highest qualification is required';
        if (!formData.fieldOfStudy) newErrors.fieldOfStudy = 'Field of study is required';
        if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
        break;
      
      case 5: // Payment Information
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!formData.bvn) newErrors.bvn = 'BVN is required';
        break;
      default: // The default case
        return null; // Or a fallback component
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        localStorage.setItem('kycFormData', JSON.stringify({ ...formData, submittedAt: new Date().toISOString() }));
      } catch (_) {}
      navigate('/dashboard');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${step === currentStep ? 'bg-purple-600 text-white' : 
              step < currentStep ? 'bg-green-500 text-white' : 
              'bg-gray-200 text-gray-600'}
          `}>
            {step < currentStep ? '✓' : step}
          </div>
          {step < 5 && (
            <div className={`w-16 h-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-900">Section 1: Personal Information</h2>
      <p className="text-gray-600 text-sm">Please fill out the following information truthfully. Your data will be used solely for identification, verification, and matching with opportunities on AfriVate.</p>
      
      <Input
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          placeholder="DD/MM/YYYY"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
          <div className="relative">
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="input-field appearance-none"
              disabled
            >
              <option value="NIGERIAN">NIGERIAN</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12l-5-5 1.41-1.41L10 9.17l3.59-3.58L15 7l-5 5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="flex space-x-6">
          {['MALE', 'FEMALE', 'RATHER NOT SAY'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={option}
                checked={formData.gender === option}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
      </div>

      <Input
        label="State/City of Residence"
        name="stateOfResidence"
        value={formData.stateOfResidence}
        onChange={handleChange}
        error={errors.stateOfResidence}
      />
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-900">Section 2: Contact Information</h2>
      <p className="text-gray-600 text-sm">Please fill out the following information truthfully. Your data will be used solely for identification, verification, and matching with opportunities on AfriVate.</p>

      <div className="space-y-6">
        <div className="flex justify-center space-x-4 mb-6">
          {['google', 'facebook', 'twitter'].map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  socialMedia: {
                    ...prev.socialMedia,
                    [platform]: !prev.socialMedia[platform]
                  }
                }));
              }}
              className={`
                w-12 h-12 rounded-lg border-2 flex items-center justify-center
                ${formData.socialMedia[platform] 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-gray-300 text-gray-400'}
              `}
            >
              <i className={`fab fa-${platform} text-xl`}></i>
            </button>
          ))}
        </div>

        <div className="text-center text-gray-600 mb-6">Or</div>

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
      </div>
    </div>
  );

  const renderIdentityVerification = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-900">Section 3: Identity Verification</h2>
      <p className="text-gray-600 text-sm">Please fill out the following information truthfully. Your data will be used solely for identification, verification, and matching with opportunities on AfriVate.</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tick one verification Method</label>
        <div className="space-y-3">
          {[
            'National ID (NIN)',
            'Voter\'s Card',
            'International Passport',
            'Student ID'
          ].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="idType"
                value={option}
                checked={formData.idType === option}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        {errors.idType && <p className="mt-1 text-sm text-red-600">{errors.idType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Proof of Address</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="proofOfAddress"
                  type="file"
                  className="sr-only"
                  onChange={handleChange}
                  accept="image/*,.pdf"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
        {errors.proofOfAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.proofOfAddress}</p>
        )}
        {formData.proofOfAddress && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {formData.proofOfAddress.name}
          </p>
        )}
      </div>
    </div>
  );

  const renderEducationExperience = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-900">Section 4: Education & Experience</h2>
      <p className="text-gray-600 text-sm">Please fill out the following information truthfully. Your data will be used solely for identification, verification, and matching with opportunities on AfriVate.</p>

      <Input
        label="Highest Qualification"
        name="highestQualification"
        value={formData.highestQualification}
        onChange={handleChange}
        error={errors.highestQualification}
      />

      <Input
        label="Field of Study"
        name="fieldOfStudy"
        value={formData.fieldOfStudy}
        onChange={handleChange}
        error={errors.fieldOfStudy}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Employment Status</label>
        <div className="flex space-x-6">
          {['Employed', 'Not Employed', 'Freelancing'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="employmentStatus"
                value={option}
                checked={formData.employmentStatus === option}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        {errors.employmentStatus && (
          <p className="mt-1 text-sm text-red-600">{errors.employmentStatus}</p>
        )}
      </div>

      <Input
        label="Years of Experience"
        name="yearsOfExperience"
        type="number"
        min="0"
        value={formData.yearsOfExperience}
        onChange={handleChange}
        error={errors.yearsOfExperience}
      />
    </div>
  );

  const renderPaymentInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-900">Section 5: Payment Information</h2>
      <p className="text-gray-600 text-sm">Please fill out the following information truthfully. Your data will be used solely for identification, verification, and matching with opportunities on AfriVate.</p>

      <Input
        label="Bank Name"
        name="bankName"
        value={formData.bankName}
        onChange={handleChange}
        error={errors.bankName}
      />

      <Input
        label="Account Number"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        error={errors.accountNumber}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          BVN <span className="text-purple-600">(For Secure Verification)</span>
        </label>
        <Input
          name="bvn"
          value={formData.bvn}
          onChange={handleChange}
          error={errors.bvn}
        />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
          />
          <label className="ml-2 block text-sm text-gray-600">
            By submitting this form, I confirm that the information provided is accurate to the best of my knowledge.
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
          />
          <label className="ml-2 block text-sm text-gray-600">
            I consent to AfriVate using this information for identification, verification, and job/gig matching purposes in line with its Privacy Policy.
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderContactInfo();
      case 3:
        return renderIdentityVerification();
      case 4:
        return renderEducationExperience();
      case 5:
        return renderPaymentInfo();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {renderCurrentStep()}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext}>
                  Proceed
                </Button>
              ) : (
                <Button type="submit">
                  Submit
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCForm; 
