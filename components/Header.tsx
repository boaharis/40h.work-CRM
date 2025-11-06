'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <div className="flex items-center flex-1">
        <input
          type="search"
          placeholder="Search customers, leads, jobs..."
          className="w-96 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100">
          <span className="text-xl">🔔</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left">
              <div className="text-sm font-medium text-neutral-900">
                {user?.displayName || 'User'}
              </div>
              <div className="text-xs text-neutral-500 capitalize">
                {user?.role}
              </div>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
              <button
                onClick={() => {
                  router.push('/dashboard/profile');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
