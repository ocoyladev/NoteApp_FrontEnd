import React from 'react';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showAuthButton?: boolean;
  onAuthClick?: () => void;
  isAuthenticated?: boolean;
}

export function Layout({ children, showAuthButton = true, onAuthClick, isAuthenticated }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">NoteApp</h1>
            </div>
            {showAuthButton && (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Product developed by ocudev</p>
        </div>
      </footer>
    </div>
  );
}