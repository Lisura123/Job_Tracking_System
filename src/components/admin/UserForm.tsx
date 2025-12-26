import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-lg shadow-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl sm:rounded-t-lg">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              inputMode="email"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {user && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              required={!user}
              minLength={8}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={user ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              required
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'viewer' })}
            >
              <option value="user">Data Entry</option>
              <option value="viewer">View Only (Search)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-4 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-1 sm:order-2"
            >
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
