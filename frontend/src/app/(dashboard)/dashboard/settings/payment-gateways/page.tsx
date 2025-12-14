'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CreditCard, CheckCircle, XCircle, AlertCircle, ExternalLink, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';

interface Gateway {
  id: string;
  gatewayType: 'STRIPE' | 'PAYPAL' | 'RAZORPAY' | 'UPI';
  isActive: boolean;
  connectAccountId?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentGatewaysPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const toast = useToast();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [connectingPayPal, setConnectingPayPal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [payPalForm, setPayPalForm] = useState({
    clientId: '',
    clientSecret: '',
    mode: 'sandbox' as 'live' | 'sandbox',
  });
  const [submittingPayPal, setSubmittingPayPal] = useState(false);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/merchant/payment-gateways');
      setGateways(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load payment gateways');
    } finally {
      setIsLoading(false);
    }
  };

  const createStripeConnectAccount = async () => {
    try {
      setConnectingStripe(true);
      const response = await api.post('/merchant/payment-gateways/stripe/connect', {
        email: user?.email,
        country: 'US',
        type: 'express',
      });

      // Get account link
      const linkResponse = await api.get('/merchant/payment-gateways/stripe/connect-link');
      const { url } = linkResponse.data.data;

      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create Stripe Connect account';
      
      // Show more helpful error messages
      if (errorMessage.includes('not configured') || errorMessage.includes('STRIPE_SECRET_KEY')) {
        toast.error('Stripe is not configured on the server. Please contact the administrator.');
      } else if (errorMessage.includes('Invalid Stripe API key')) {
        toast.error('Invalid Stripe API key. Please contact the administrator.');
      } else {
        toast.error(errorMessage);
      }
      setConnectingStripe(false);
    }
  };

  const connectPayPal = () => {
    setShowPayPalModal(true);
  };

  const submitPayPalConnection = async () => {
    if (!payPalForm.clientId || !payPalForm.clientSecret) {
      toast.error('Please enter both Client ID and Client Secret');
      return;
    }

    try {
      setSubmittingPayPal(true);
      const response = await api.post('/merchant/payment-gateways/paypal/connect', {
        gatewayType: 'PAYPAL',
        credentials: {
          clientId: payPalForm.clientId,
          clientSecret: payPalForm.clientSecret,
          mode: payPalForm.mode,
        },
      });

      toast.success('PayPal account connected successfully');
      setShowPayPalModal(false);
      setPayPalForm({ clientId: '', clientSecret: '', mode: 'sandbox' });
      fetchGateways();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to connect PayPal account');
    } finally {
      setSubmittingPayPal(false);
    }
  };

  const verifyGateway = async (id: string) => {
    try {
      setVerifyingId(id);
      await api.post(`/merchant/payment-gateways/${id}/verify`);
      toast.success('Gateway verified successfully');
      fetchGateways();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const deactivateGateway = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this gateway?')) return;

    try {
      await api.post(`/merchant/payment-gateways/${id}/deactivate`);
      toast.success('Gateway deactivated');
      fetchGateways();
    } catch (error: any) {
      toast.error('Failed to deactivate gateway');
    }
  };

  const deleteGateway = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gateway? This action cannot be undone.')) return;

    try {
      await api.delete(`/merchant/payment-gateways/${id}`);
      toast.success('Gateway deleted');
      fetchGateways();
    } catch (error: any) {
      toast.error('Failed to delete gateway');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success">Verified</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGatewayName = (type: string) => {
    switch (type) {
      case 'STRIPE':
        return 'Stripe';
      case 'PAYPAL':
        return 'PayPal';
      case 'RAZORPAY':
        return 'Razorpay';
      case 'UPI':
        return 'UPI';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="page-transition">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse mb-4" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <FeatureFlagGuard feature="payments" redirectTo="/dashboard/settings">
      <div className="page-transition">
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">Payment Gateways</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Connect and manage your payment gateways to receive payments directly to your account</p>

        <Card>
          <CardHeader>
            <CardTitle>Available Gateways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Stripe Connect</h3>
                  </div>
                  {gateways.some((g) => g.gatewayType === 'STRIPE') && (
                    <Badge variant="success">Connected</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Connect your Stripe account to receive payments directly
                </p>
                {!gateways.some((g) => g.gatewayType === 'STRIPE') ? (
                  <Button
                    onClick={createStripeConnectAccount}
                    disabled={connectingStripe}
                    variant="primary"
                    className="w-full"
                  >
                    {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const stripeGateway = gateways.find((g) => g.gatewayType === 'STRIPE');
                      if (stripeGateway) {
                        window.open(
                          `/api/v1/merchant/payment-gateways/stripe/connect-link`,
                          '_blank'
                        );
                      }
                    }}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Update Account
                  </Button>
                )}
              </div>

              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">PayPal</h3>
                  </div>
                  {gateways.some((g) => g.gatewayType === 'PAYPAL') && (
                    <Badge variant="success">Connected</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Connect your PayPal Business account
                </p>
                {!gateways.some((g) => g.gatewayType === 'PAYPAL') ? (
                  <Button
                    onClick={connectPayPal}
                    disabled={connectingPayPal}
                    variant="primary"
                    className="w-full"
                  >
                    {connectingPayPal ? 'Connecting...' : 'Connect PayPal'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Connected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      {gateways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Gateways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gateways.map((gateway) => (
                <div
                  key={gateway.id}
                  className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center justify-between bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{getGatewayName(gateway.gatewayType)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(gateway.verificationStatus)}
                        {gateway.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Inactive</Badge>
                        )}
                      </div>
                      {gateway.connectAccountId && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Account: {gateway.connectAccountId.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gateway.verificationStatus !== 'VERIFIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyGateway(gateway.id)}
                        disabled={verifyingId === gateway.id}
                      >
                        {verifyingId === gateway.id ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                    {gateway.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateGateway(gateway.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteGateway(gateway.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        {/* PayPal Connection Modal */}
        {showPayPalModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Connect PayPal Account</CardTitle>
                  <button
                    onClick={() => {
                      setShowPayPalModal(false);
                      setPayPalForm({ clientId: '', clientSecret: '', mode: 'sandbox' });
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Client ID
                    </label>
                  <Input
                    type="text"
                    value={payPalForm.clientId}
                    onChange={(e) => setPayPalForm({ ...payPalForm, clientId: e.target.value })}
                    placeholder="Enter your PayPal Client ID"
                    className="w-full"
                  />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Client Secret
                    </label>
                    <Input
                      type="password"
                      value={payPalForm.clientSecret}
                      onChange={(e) => setPayPalForm({ ...payPalForm, clientSecret: e.target.value })}
                      placeholder="Enter your PayPal Client Secret"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mode
                    </label>
                    <select
                      value={payPalForm.mode}
                      onChange={(e) => setPayPalForm({ ...payPalForm, mode: e.target.value as 'live' | 'sandbox' })}
                      className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="live">Live (Production)</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Use Sandbox for testing, Live for production
                    </p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/30 rounded-lg p-3">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200">
                      <strong>Where to find these credentials:</strong>
                    </p>
                    <ul className="text-xs text-cyan-700 dark:text-cyan-300 mt-2 list-disc list-inside space-y-1">
                    <li>Log in to your PayPal Developer account</li>
                    <li>Go to Apps & Credentials</li>
                    <li>Create or select your app</li>
                    <li>Copy the Client ID and Secret</li>
                  </ul>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPayPalModal(false);
                      setPayPalForm({ clientId: '', clientSecret: '', mode: 'sandbox' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitPayPalConnection}
                    disabled={submittingPayPal || !payPalForm.clientId || !payPalForm.clientSecret}
                    variant="primary"
                    className="flex-1"
                  >
                    {submittingPayPal ? 'Connecting...' : 'Connect PayPal'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </FeatureFlagGuard>
  );
}

