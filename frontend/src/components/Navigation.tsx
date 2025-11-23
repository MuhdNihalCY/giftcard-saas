'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
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

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isDashboard = pathname?.startsWith('/dashboard');
  const isPublic = !isDashboard && !pathname?.startsWith('/login') && !pathname?.startsWith('/register');

  return (
    <nav className="bg-navy-800/95 backdrop-blur-md border-b border-navy-700/50 sticky top-0 z-50 shadow-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={isAuthenticated && user?.role !== 'CUSTOMER' ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
              <span className="text-2xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                🎁 GiftCard
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {isAuthenticated ? (
              <>
                {isDashboard ? (
                  <>
                    <NavLink href="/dashboard" pathname={pathname}>Dashboard</NavLink>
                    {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && (
                      <>
                        <NavLink href="/dashboard/gift-cards" pathname={pathname}>Gift Cards</NavLink>
                        <NavLink href="/dashboard/templates" pathname={pathname}>Templates</NavLink>
                        <NavLink href="/dashboard/analytics" pathname={pathname}>Analytics</NavLink>
                        <NavLink href="/dashboard/redeem" pathname={pathname}>Redeem</NavLink>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <NavLink href="/dashboard/users" pathname={pathname}>Users</NavLink>
                        <NavLink href="/dashboard/admin/communications" pathname={pathname}>Communications</NavLink>
                      </>
                    )}
                    <NavLink href="/wallet" pathname={pathname}>Wallet</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink href="/" pathname={pathname}>Home</NavLink>
                    <NavLink href="/browse" pathname={pathname}>Browse</NavLink>
                    <NavLink href="/check-balance" pathname={pathname}>Check Balance</NavLink>
                    <NavLink href="/wallet" pathname={pathname}>My Wallet</NavLink>
                  </>
                )}
              </>
            ) : (
              <>
                <NavLink href="/" pathname={pathname}>Home</NavLink>
                <NavLink href="/browse" pathname={pathname}>Browse</NavLink>
                <NavLink href="/check-balance" pathname={pathname}>Check Balance</NavLink>
              </>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          {isPublic && (
            <div className="hidden lg:flex items-center flex-1 max-w-md ml-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search gift cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-navy-700/50 border border-plum-500/30 rounded-lg text-navy-50 placeholder-plum-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-plum-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative user-menu-button">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-navy-700/50 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-plum-600 flex items-center justify-center text-navy-50 font-semibold">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:block text-plum-200 text-sm">{user?.firstName || user?.email}</span>
                  <svg
                    className={`w-4 h-4 text-plum-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-700 rounded-lg shadow-luxury py-2 user-menu">
                    <div className="px-4 py-2 border-b border-navy-700">
                      <p className="text-sm font-semibold text-navy-50">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-plum-300 truncate">{user?.email}</p>
                    </div>
                    {!isDashboard && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-plum-200 hover:bg-navy-700/50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-plum-200 hover:bg-navy-700/50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-navy-700/50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="gold" size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-navy-700/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-plum-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-700">
            <div className="space-y-2">
              {isPublic && (
                <form onSubmit={handleSearch} className="px-2 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search gift cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-navy-700/50 border border-plum-500/30 rounded-lg text-navy-50 placeholder-plum-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-5 w-5 text-plum-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>
              )}
              {isAuthenticated ? (
                <>
                  {isDashboard ? (
                    <>
                      <MobileNavLink href="/dashboard" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                      {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && (
                        <>
                          <MobileNavLink href="/dashboard/gift-cards" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Gift Cards</MobileNavLink>
                          <MobileNavLink href="/dashboard/templates" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Templates</MobileNavLink>
                          <MobileNavLink href="/dashboard/analytics" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Analytics</MobileNavLink>
                          <MobileNavLink href="/dashboard/redeem" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Redeem</MobileNavLink>
                        </>
                      )}
                      {user?.role === 'ADMIN' && (
                        <>
                          <MobileNavLink href="/dashboard/users" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Users</MobileNavLink>
                          <MobileNavLink href="/dashboard/admin/communications" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Communications</MobileNavLink>
                        </>
                      )}
                      <MobileNavLink href="/wallet" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Wallet</MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="/" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                      <MobileNavLink href="/browse" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Browse</MobileNavLink>
                      <MobileNavLink href="/check-balance" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Check Balance</MobileNavLink>
                      <MobileNavLink href="/wallet" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>My Wallet</MobileNavLink>
                      <MobileNavLink href="/dashboard" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                    </>
                  )}
                  <MobileNavLink href="/dashboard/settings" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Settings</MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-navy-700/50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                  <MobileNavLink href="/browse" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Browse</MobileNavLink>
                  <MobileNavLink href="/check-balance" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)}>Check Balance</MobileNavLink>
                  <div className="px-4 pt-2 space-y-2">
                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button variant="gold" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string | null; children: React.ReactNode }) {
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-plum-600/30 text-gold-400 border border-plum-500/50'
          : 'text-plum-200 hover:bg-navy-700/50 hover:text-gold-300'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, pathname, onClick, children }: { href: string; pathname: string | null; onClick: () => void; children: React.ReactNode }) {
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-plum-600/30 text-gold-400 border border-plum-500/50'
          : 'text-plum-200 hover:bg-navy-700/50'
      }`}
    >
      {children}
    </Link>
  );
}

