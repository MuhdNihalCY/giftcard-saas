'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Show scroll to top button when scrolled
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkAuth]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      
      {/* Hero Section */}
      <main className="page-transition">
        <section className="relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-plum-900/20"></div>
          <div className="absolute inset-0 bg-gold-glow opacity-10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6">
                <span className="bg-gold-gradient bg-clip-text text-transparent">
                  Digital Gift Cards
                </span>
                <br />
                <span className="text-plum-300">Made Simple</span>
              </h1>
              <p className="mt-6 text-xl sm:text-2xl text-navy-200 max-w-3xl mx-auto leading-relaxed">
                Experience digital gift cards. Perfect for businesses and customers
                who want a seamless experience in every transaction.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link href="/register">
                      <Button variant="gold" size="lg" className="text-lg px-8 py-4">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/browse">
                      <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-plum-500 text-plum-300 hover:bg-plum-900/30">
                        Browse Gift Cards
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/browse">
                      <Button variant="gold" size="lg" className="text-lg px-8 py-4">
                        Browse Gift Cards
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-plum-500 text-plum-300 hover:bg-plum-900/30">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-plum-300 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-navy-200 max-w-2xl mx-auto">
              Features designed for exceptional experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-3">Easy Creation</h3>
              <p className="text-navy-200">
                Create beautiful gift cards in minutes with our intuitive interface.
                No technical expertise required.
              </p>
            </Card>
            <Card className="text-center hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-3">Multiple Payments</h3>
              <p className="text-navy-200">
                Accept payments via Stripe, PayPal, Razorpay, and UPI. Secure transactions
                with industry-leading encryption.
              </p>
            </Card>
            <Card className="text-center hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-3">QR Code Redemption</h3>
              <p className="text-navy-200">
                Quick and easy redemption with QR codes or gift card codes. Instant verification
                and seamless experience.
              </p>
            </Card>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-navy-800/50 border-y border-navy-700/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 text-navy-200">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Verified Platform</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''} bg-gold-gradient text-navy-900 p-3 rounded-full shadow-luxury hover:shadow-gold-glow transition-all`}
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
