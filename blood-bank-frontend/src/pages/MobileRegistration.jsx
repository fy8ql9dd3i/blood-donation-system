import React, { useState } from 'react';
import donorService from '../services/donorService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Validate Ethiopian phone number
 * Format: 09XXXXXXXXX (10 digits starting with 09)
 * Also accepts: +251911234567, 251911234567, 911234567
 */
const validateEthiopianPhone = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' };

  const cleaned = String(phone)
    .trim()
    .replace(/[\s\-().+]/g, '');

  // Handle different formats and convert to 09XXXXXXXXX
  let normalized = cleaned;

  // If starts with +251, remove + and convert to 09
  if (cleaned.startsWith('+251') && cleaned.length === 13) {
    normalized = '0' + cleaned.substring(4);
  }
  // If starts with 251 (without +), convert to 09
  else if (cleaned.startsWith('251') && cleaned.length === 12) {
    normalized = '0' + cleaned.substring(3);
  }
  // If missing leading 0 (9XXXXXXXXX), add it
  else if (cleaned.startsWith('9') && cleaned.length === 9) {
    normalized = '0' + cleaned;
  }

  // Final validation: must be 09 followed by 8 digits
  const ethiopianPhoneRegex = /^09\d{8}$/;

  if (!ethiopianPhoneRegex.test(normalized)) {
    return {
      valid: false,
      error: 'Invalid phone format. Please use: 09XX-XXXX-XXX (Example: 0911-234567)',
      example: '0911234567 or +251911234567'
    };
  }

  return { valid: true, normalized, error: null };
};

/**
 * Validate age
 * Must be between 18 and 65
 */
const validateAge = (age) => {
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    return { valid: false, error: 'Age must be a number' };
  }
  if (ageNum < 18) {
    return { valid: false, error: 'You must be at least 18 years old to donate' };
  }
  if (ageNum > 65) {
    return { valid: false, error: 'Maximum age for donation is 65 years' };
  }
  return { valid: true, error: null };
};

const MobileRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    registeredBy: 'mobile'
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Real-time validation on field change
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate age
    const ageValidation = validateAge(formData.age);
    if (!ageValidation.valid) {
      newErrors.age = ageValidation.error;
    }

    // Validate phone
    const phoneValidation = validateEthiopianPhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Validate address
    if (!formData.address || formData.address.trim().length < 2) {
      newErrors.address = 'Address must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    setLoading(true);
    try {
      // Use normalized phone
      const phoneValidation = validateEthiopianPhone(formData.phone);
      const submissionData = {
        ...formData,
        phone: phoneValidation.normalized,
        age: parseInt(formData.age)
      };

      const result = await donorService.register(submissionData);

      if (result.alreadyExists) {
        setMessage('✅ You are already registered! Our lab will verify your details.');
        toast.info('Donor already registered');
      } else {
        setMessage('✅ Successfully registered! Please visit our lab for blood type testing.');
        toast.success('Registration successful!');
        // Reset form
        setFormData({
          name: '',
          age: '',
          phone: '',
          address: '',
          registeredBy: 'mobile'
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setMessage(`❌ ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-red-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-500"></div>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🩸</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Donor Portal</h1>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Blood Donation Registration</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center text-sm font-bold shadow-sm border ${message.includes('❌')
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-green-100 text-green-700 border-green-200'
            }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.name
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-slate-300 focus:ring-red-500'
                }`}
            />
            {errors.name && <p className="text-red-600 text-xs font-semibold mt-1">⚠️ {errors.name}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Age *</label>
            <input
              type="number"
              placeholder="Enter your age (18-65)"
              min="18"
              max="65"
              value={formData.age}
              onChange={(e) => handleFieldChange('age', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.age
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-slate-300 focus:ring-red-500'
                }`}
            />
            {errors.age && <p className="text-red-600 text-xs font-semibold mt-1">⚠️ {errors.age}</p>}
            <p className="text-slate-400 text-xs mt-1">Must be 18-65 years old</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number * (Ethiopian)</label>
            <input
              type="tel"
              placeholder="09XX-XXXX-XXX or +251-9XX-XXXX-XXX"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.phone
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-slate-300 focus:ring-red-500'
                }`}
            />
            {errors.phone && <p className="text-red-600 text-xs font-semibold mt-1">⚠️ {errors.phone}</p>}
            <p className="text-slate-400 text-xs mt-1">Examples: 0911234567, +251911234567, or 251911234567</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Address / Region *</label>
            <input
              type="text"
              placeholder="City, Region, or District"
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.address
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-slate-300 focus:ring-red-500'
                }`}
            />
            {errors.address && <p className="text-red-600 text-xs font-semibold mt-1">⚠️ {errors.address}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-lg rounded-lg hover:from-red-700 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider mt-6"
          >
            {loading ? '⏳ Registering...' : '✅ Register Me'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm mb-4">Already registered?</p>
          <button
            onClick={() => navigate('/login')}
            className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors"
          >
            👤 Lab Staff Sign In
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-xs font-semibold">
            💡 <strong>First time?</strong> Fill out this form, then visit our lab for blood type testing and health screening.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MobileRegistration;
