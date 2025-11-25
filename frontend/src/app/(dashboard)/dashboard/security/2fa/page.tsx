'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import logger from '@/lib/logger';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled' | 'backup-codes'>('setup');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorStatus, setTwoFactorStatus] = useState<{ enabled: boolean; remainingBackupCodes: number } | null>(null);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/status');
      setTwoFactorStatus(response.data.data);
      if (response.data.data.enabled) {
        setStep('enabled');
      }
    } catch (err: unknown) {
      logger.error('Failed to fetch 2FA status', { error: err });
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/2fa/setup');
      setSetup(response.data.data);
      setStep('verify');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to setup 2FA';
      setError(errorMessage);
      logger.error('Failed to setup 2FA', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!setup || !verificationToken) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/2fa/enable', {
        secret: setup.secret,
        token: verificationToken,
      });
      setBackupCodes(response.data.data.backupCodes);
      setStep('backup-codes');
      await fetchStatus();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to enable 2FA';
      setError(errorMessage);
      logger.error('Failed to enable 2FA', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    try {
      setLoading(true);
      setError('');
      await api.post('/auth/2fa/disable', { password });
      setStep('setup');
      setSetup(null);
      await fetchStatus();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to disable 2FA';
      setError(errorMessage);
      logger.error('Failed to disable 2FA', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/2fa/backup-codes/regenerate');
      setBackupCodes(response.data.data.backupCodes);
      setStep('backup-codes');
      await fetchStatus();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to regenerate backup codes';
      setError(errorMessage);
      logger.error('Failed to regenerate backup codes', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!backupCodes.length) return;

    const content = `Gift Card SaaS - Two-Factor Authentication Backup Codes\n\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `User: ${user?.email}\n\n` +
      `IMPORTANT: Save these codes in a safe place. Each code can only be used once.\n\n` +
      backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n') +
      `\n\nIf you lose access to your authenticator app, you can use these codes to log in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'enabled') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-green-300">2FA is Enabled</h3>
                  <p className="text-sm text-green-200 mt-1">
                    Your account is protected with two-factor authentication.
                  </p>
                  {twoFactorStatus && (
                    <p className="text-sm text-green-200 mt-2">
                      Remaining backup codes: {twoFactorStatus.remainingBackupCodes}
                    </p>
                  )}
                </div>
                <div className="text-4xl">✓</div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                  variant="outline"
                >
                  Regenerate Backup Codes
                </Button>
                <Button
                  onClick={handleDisable}
                  disabled={loading}
                  variant="destructive"
                >
                  Disable 2FA
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'backup-codes') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Save Your Backup Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-yellow-300 font-semibold mb-2">Important:</p>
                <ul className="list-disc list-inside text-yellow-200 space-y-1 text-sm">
                  <li>Save these codes in a safe place</li>
                  <li>Each code can only be used once</li>
                  <li>You can use these codes if you lose access to your authenticator app</li>
                  <li>You can regenerate new codes at any time</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-navy-800 rounded-lg border border-navy-700">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-lg text-center p-3 bg-navy-900 rounded border border-navy-700">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={downloadBackupCodes} variant="outline">
                  Download Codes
                </Button>
                <Button onClick={() => { setStep('enabled'); fetchStatus(); }}>
                  I've Saved My Codes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify' && setup) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Verify and Enable 2FA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Scan this QR code with your authenticator app</h3>
                <div className="flex justify-center p-4 bg-white rounded-lg inline-block">
                  <QRCodeSVG value={setup.qrCodeUrl} size={256} />
                </div>
              </div>

              <div className="p-4 bg-navy-800 rounded-lg border border-navy-700">
                <p className="text-sm text-plum-200 mb-2">Can't scan? Enter this code manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-navy-900 rounded font-mono text-sm border border-navy-700">
                    {showSecret ? setup.secret : '••••••••••••••••'}
                  </code>
                  <Button
                    onClick={() => setShowSecret(!showSecret)}
                    variant="outline"
                    size="sm"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-plum-300 mb-2">
                  Enter the 6-digit code from your authenticator app
                </label>
                <Input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleEnable}
                  disabled={loading || verificationToken.length !== 6}
                >
                  Enable 2FA
                </Button>
                <Button
                  onClick={() => { setStep('setup'); setSetup(null); }}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">What is Two-Factor Authentication?</h3>
              <p className="text-blue-200 text-sm">
                Two-factor authentication adds an extra layer of security to your account. 
                After enabling 2FA, you'll need to enter a code from your authenticator app 
                (like Google Authenticator or Authy) in addition to your password when logging in.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-plum-300">To get started:</h4>
              <ol className="list-decimal list-inside space-y-2 text-plum-200">
                <li>Install an authenticator app on your phone (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                <li>Click "Setup 2FA" below to generate a QR code</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code to verify and enable 2FA</li>
                <li>Save your backup codes in a safe place</li>
              </ol>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <Button
              onClick={handleSetup}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

