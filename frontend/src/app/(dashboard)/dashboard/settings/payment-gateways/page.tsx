'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CreditCard, CheckCircle, XCircle, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';

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
  const toast = useToast();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [connectingPayPal, setConnectingPayPal] = useState(false);

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
      toast.error(error.response?.data?.message || 'Failed to create Stripe Connect account');
      setConnectingStripe(false);
    }
  };

  const connectPayPal = async () => {
    try {
      setConnectingPayPal(true);
      // Show form or redirect to PayPal OAuth
      toast.info('PayPal connection requires API credentials. Please contact support.');
      setConnectingPayPal(false);
    } catch (error: any) {
      toast.error('Failed to connect PayPal');
      setConnectingPayPal(false);
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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-gray-600 mt-1">Connect and manage your payment gateways</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-semibold">Stripe Connect</h3>
                </div>
                {gateways.some((g) => g.gatewayType === 'STRIPE') && (
                  <Badge variant="success">Connected</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Connect your Stripe account to receive payments directly
              </p>
              {!gateways.some((g) => g.gatewayType === 'STRIPE') ? (
                <Button
                  onClick={createStripeConnectAccount}
                  disabled={connectingStripe}
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

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-semibold">PayPal</h3>
                </div>
                {gateways.some((g) => g.gatewayType === 'PAYPAL') && (
                  <Badge variant="success">Connected</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Connect your PayPal Business account
              </p>
              {!gateways.some((g) => g.gatewayType === 'PAYPAL') ? (
                <Button
                  onClick={connectPayPal}
                  disabled={connectingPayPal}
                  variant="outline"
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
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold">{getGatewayName(gateway.gatewayType)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(gateway.verificationStatus)}
                        {gateway.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Inactive</Badge>
                        )}
                      </div>
                      {gateway.connectAccountId && (
                        <p className="text-xs text-gray-500 mt-1">
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
                      className="text-red-600 hover:text-red-700"
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
    </div>
  );
}

