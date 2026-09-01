'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { FileText, Plus, LogOut, User } from '@/components/Icons';
import { useState } from 'react';

export default function Navbar({ showNewButton = true }) {
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/quotations" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
                Quote<span className="text-orange-500">Nest</span>
              </span>
              <p className="text-xs text-gray-500 font-medium -mt-1">
                Quotation Management
              </p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {showNewButton && (
              <Link
                href="/quotations/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>New Quotation</span>
              </Link>
            )}

            {/* Profile Link */}
            <Link
              href="/profile"
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors focus:outline-none"
              title="My Profile"
            >
              <User className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>Profile</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
