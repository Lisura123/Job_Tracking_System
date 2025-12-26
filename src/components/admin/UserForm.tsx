import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserFormData } from '../../services/userService';

interface UserFormProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
  } | null;
  onSubmit: (data: UserFormData) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access - manage users, jobs, and all data';
      case 'user':
        return 'Can create and manage jobs, customers, and view all data';
      case 'viewer':
        return 'Read-only access - can search and view job details only';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center z-10 rounded-t-2xl sm:rounded-t-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {user ? 'Edit User' : 'Add New User'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white hover:bg-white hover:bg-opacity-20 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className={`block w-full pl-10 pr-3 py-3 border-2 ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm sm:text-base transition-all`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter user's full name"
              />
            </div>
            {errors.name && (
              <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                inputMode="email"
                className={`block w-full pl-10 pr-3 py-3 border-2 ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm sm:text-base transition-all`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="user@example.com"
              />
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password {!user && <span className="text-red-500">*</span>}
              {user && <span className="text-xs text-gray-500 font-normal ml-2">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required={!user}
                minLength={8}
                className={`block w-full pl-10 pr-12 py-3 border-2 ${
                  errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm sm:text-base transition-all`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder={user ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg px-3 transition"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.password}</span>
              </div>
            )}
            {!errors.password && formData.password && formData.password.length < 8 && (
              <p className="mt-2 text-sm text-amber-600">
                Password strength: {formData.password.length}/8 characters
              </p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                required
                className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white transition-all cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'viewer' })}
              >
                <option value="user">📝 Data Entry User</option>
                <option value="viewer">👁️ View Only User</option>
                <option value="admin">⚡ Administrator</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>
                  {formData.role === 'admin' && '⚡ Administrator: '}
                  {formData.role === 'user' && '📝 Data Entry User: '}
                  {formData.role === 'viewer' && '👁️ View Only User: '}
                </strong>
                {getRoleDescription(formData.role)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] w-full sm:w-auto px-8 py-3 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all order-1 sm:order-2"
            >
              {user ? '✓ Update User' : '+ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
