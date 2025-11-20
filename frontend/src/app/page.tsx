'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">🎁 GiftCard SaaS</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/wallet">
                    <Button variant="outline">My Wallet</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Digital Gift Cards
            <span className="text-primary-600"> Made Simple</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Create, sell, and manage digital gift cards with ease. Perfect for businesses
            of all sizes looking to offer gift cards to their customers.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            {!isAuthenticated && (
              <>
                <Link href="/register">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link href="/browse">
                  <Button size="lg" variant="outline">Browse Gift Cards</Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-2">Easy Creation</h3>
            <p className="text-gray-600">
              Create beautiful gift cards in minutes with our intuitive interface.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Multiple Payments</h3>
            <p className="text-gray-600">
              Accept payments via Stripe, PayPal, Razorpay, and UPI.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">QR Code Redemption</h3>
            <p className="text-gray-600">
              Quick and easy redemption with QR codes or gift card codes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
