'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import logger from '@/lib/logger';

interface Device {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastUsedAt: string;
  createdAt: string;
}

export default function DeviceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState('');
  const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/devices');
      setDevices(response.data.data.devices);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to fetch devices';
      setError(errorMessage);
      logger.error('Failed to fetch devices', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke this device? You will need to log in again from this device.')) {
      return;
    }

    try {
      setRevokingDeviceId(deviceId);
      await api.delete(`/auth/devices/${deviceId}`);
      await fetchDevices();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to revoke device';
      setError(errorMessage);
      logger.error('Failed to revoke device', { error: err });
    } finally {
      setRevokingDeviceId(null);
    }
  };

  const handleRevokeAllDevices = async () => {
    if (!confirm('Are you sure you want to revoke all devices? You will be logged out from all devices and need to log in again.')) {
      return;
    }

    try {
      setRevokingAll(true);
      await api.delete('/auth/devices');
      await fetchDevices();
      // Optionally redirect to login
      window.location.href = '/login';
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to revoke all devices';
      setError(errorMessage);
      logger.error('Failed to revoke all devices', { error: err });
    } finally {
      setRevokingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'MOBILE':
        return '📱';
      case 'TABLET':
        return '📱';
      case 'DESKTOP':
        return '💻';
      default:
        return '🖥️';
    }
  };

  const isCurrentDevice = (device: Device) => {
    // This is a simplified check - in production, you might want to store the current device ID
    // For now, we'll consider the most recently used device as the current one
    const sortedDevices = [...devices].sort((a, b) => 
      new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    );
    return sortedDevices[0]?.id === device.id;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Device Management</CardTitle>
            {devices.length > 0 && (
              <Button
                onClick={handleRevokeAllDevices}
                disabled={revokingAll}
                variant="danger"
              >
                {revokingAll ? 'Revoking...' : 'Logout All Devices'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {devices.length === 0 ? (
              <div className="text-center py-8 text-plum-300">
                <p>No active devices found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 bg-navy-800 rounded-lg border border-navy-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-plum-300">
                            {device.deviceName || 'Unknown Device'}
                          </h3>
                          {isCurrentDevice(device) && (
                            <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded border border-green-700">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-plum-200 mt-1 space-y-1">
                          {device.deviceType && (
                            <p>Type: {device.deviceType}</p>
                          )}
                          {device.ipAddress && (
                            <p>IP Address: {device.ipAddress}</p>
                          )}
                          <p>Last used: {formatDate(device.lastUsedAt)}</p>
                          <p className="text-xs text-plum-400">
                            First seen: {formatDate(device.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!isCurrentDevice(device) && (
                      <Button
                        onClick={() => handleRevokeDevice(device.id)}
                        disabled={revokingDeviceId === device.id}
                        variant="outline"
                        size="sm"
                      >
                        {revokingDeviceId === device.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Revoking a device will immediately log you out from that device. 
                You'll need to log in again to use that device. The current device cannot be revoked from this page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

