import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search, Shield, Package, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-base sm:text-xl font-bold text-gray-900 hidden sm:inline">Internal Job Tracking</span>
              <span className="text-base font-bold text-gray-900 sm:hidden">Job Tracking</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
              <Link
                to="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/search') || isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMobileMenu}
              >
                <Search className="h-4 w-4 inline mr-1" />
                Search & Track Jobs
              </Link>
              
              {isAdmin ? (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/data-entry"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/data-entry')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <Package className="h-4 w-4 inline mr-1" />
                  Data Entry Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop User Info and Logout */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                {isAdmin ? 'Administrator' : 'Data Entry'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* User Info - Mobile */}
            <div className="px-3 py-3 mb-2 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  {isAdmin ? 'Administrator' : 'Data Entry'}
                </span>
              </p>
            </div>

            {/* Navigation Links - Mobile */}
            <Link
              to="/search"
              className={`min-h-[44px] flex items-center px-3 py-3 rounded-md text-base font-medium ${
                isActive('/search') || isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              <Search className="h-5 w-5 mr-3" />
              Search & Track Jobs
            </Link>
            
            {isAdmin ? (
              <Link
                to="/admin"
                className={`min-h-[44px] flex items-center px-3 py-3 rounded-md text-base font-medium ${
                  isActive('/admin')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMobileMenu}
              >
                <Shield className="h-5 w-5 mr-3" />
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/data-entry"
                className={`min-h-[44px] flex items-center px-3 py-3 rounded-md text-base font-medium ${
                  isActive('/data-entry')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMobileMenu}
              >
                <Package className="h-5 w-5 mr-3" />
                Data Entry Dashboard
              </Link>
            )}

            {/* Logout Button - Mobile */}
            <button
              onClick={handleLogout}
              className="min-h-[44px] w-full flex items-center px-3 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
