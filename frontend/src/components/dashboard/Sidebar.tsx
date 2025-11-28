'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Gift,
  Package,
  Palette,
  ScanLine,
  TrendingUp,
  CreditCard,
  Mail,
  Users,
  Settings,
  Wallet,
  FileText,
  MessageSquare,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'MERCHANT' | 'CUSTOMER')[];
  badge?: number;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    onMobileClose();
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  // Base navigation items
  const baseNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MERCHANT', 'CUSTOMER'],
    },
  ];

  // Merchant & Admin navigation items
  const merchantNavItems: NavItem[] = [
    {
      label: 'Gift Cards',
      href: '/dashboard/gift-cards',
      icon: Gift,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Products',
      href: '/dashboard/gift-card-products',
      icon: Package,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Templates',
      href: '/dashboard/templates',
      icon: Palette,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Redeem',
      href: '/dashboard/redeem',
      icon: ScanLine,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Redemptions',
      href: '/dashboard/redemptions',
      icon: FileText,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Payments',
      href: '/dashboard/payments',
      icon: CreditCard,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Delivery',
      href: '/dashboard/delivery',
      icon: Mail,
      roles: ['ADMIN', 'MERCHANT'],
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: TrendingUp,
      roles: ['ADMIN', 'MERCHANT'],
    },
  ];

  // Admin-only navigation items
  const adminNavItems: NavItem[] = [
    {
      label: 'Users',
      href: '/dashboard/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      label: 'Communications',
      href: '/dashboard/admin/communications',
      icon: MessageSquare,
      roles: ['ADMIN'],
    },
    {
      label: 'Audit Logs',
      href: '/dashboard/admin/audit-logs',
      icon: Shield,
      roles: ['ADMIN'],
    },
  ];

  // Customer navigation items
  const customerNavItems: NavItem[] = [
    {
      label: 'My Wallet',
      href: '/dashboard/wallet',
      icon: Wallet,
      roles: ['CUSTOMER'],
    },
  ];

  // Combine all navigation items based on role
  const getNavItems = (): NavItem[] => {
    const items = [...baseNavItems];
    
    if (user?.role === 'ADMIN' || user?.role === 'MERCHANT') {
      items.push(...merchantNavItems);
    }
    
    if (user?.role === 'ADMIN') {
      items.push(...adminNavItems);
    }
    
    if (user?.role === 'CUSTOMER') {
      items.push(...customerNavItems);
    }

    // Always add settings
    items.push({
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['ADMIN', 'MERCHANT', 'CUSTOMER'],
    });

    return items.filter(item => !item.roles || item.roles.includes(user?.role as any));
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-navy-800/95 backdrop-blur-md border-r border-navy-700/50 z-50 transition-all duration-300',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-navy-700/50">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                  🎁 GiftCard
                </span>
              </Link>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-navy-700/50 text-plum-300 transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onMobileClose}
                className="lg:hidden p-1.5 rounded-lg hover:bg-navy-700/50 text-plum-300 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-navy-700/50 hover:text-gold-300',
                    active
                      ? 'bg-plum-600/30 text-gold-400 border border-plum-500/50'
                      : 'text-plum-200'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn('flex-shrink-0', isCollapsed ? 'w-5 h-5' : 'w-5 h-5')} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gold-500/20 text-gold-400">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div className="p-4 border-t border-navy-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-plum-600 flex items-center justify-center text-navy-50 font-semibold">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-50 truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.email}
                  </p>
                  <p className="text-xs text-plum-300 truncate">{user.email}</p>
                  {user.businessName && (
                    <p className="text-xs text-navy-300 truncate">{user.businessName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-red-400 hover:bg-navy-700/50 rounded-lg transition-colors text-left"
              >
                Logout
              </button>
            </div>
          )}

          {isCollapsed && user && (
            <div className="p-4 border-t border-navy-700/50">
              <div className="w-8 h-8 rounded-full bg-plum-600 flex items-center justify-center text-navy-50 font-semibold mx-auto">
                {user.firstName?.[0] || user.email?.[0] || 'U'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

