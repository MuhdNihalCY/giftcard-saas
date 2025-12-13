'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, Bell, Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to appropriate search page
      if (pathname?.startsWith('/dashboard/gift-cards')) {
        // Search within gift cards
        router.push(`/dashboard/gift-cards?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // Global search - could navigate to a search results page
        router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    if (!pathname) return [];
    
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Skip 'dashboard' in the path
    if (paths[0] === 'dashboard') {
      breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
      
      for (let i = 1; i < paths.length; i++) {
        const path = paths.slice(0, i + 1).join('/');
        const label = paths[i]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbs.push({ label, href: `/${path}` });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Menu Button & Breadcrumbs */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center space-x-2">
                  {index > 0 && (
                    <span className="text-slate-400 dark:text-slate-500">/</span>
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Center Section: Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
                  isSearchFocused ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                )}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg',
                  'text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
                  'transition-all',
                  isSearchFocused && 'border-cyan-500'
                )}
              />
            </div>
          </form>
        </div>

        {/* Right Section: Notifications & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Search Button (Mobile) */}
          <button
            onClick={() => setIsSearchFocused(!isSearchFocused)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications (Future) */}
          <button
            className="hidden lg:flex relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge can be added here */}
          </button>

          {/* User Menu */}
          <div className="relative user-menu-button">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.firstName || user?.email}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MERCHANT' ? 'Merchant' : 'Customer'}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'hidden lg:block w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform',
                  isUserMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 user-menu z-50 transition-colors">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || user?.email}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                  {user?.businessName && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-1">{user.businessName}</p>
                  )}
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchFocused && (
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

