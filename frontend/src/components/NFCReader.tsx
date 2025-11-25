'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import NFCService from '@/services/nfc.service';

interface NFCReaderProps {
  onScanSuccess: (data: { shareToken: string; url: string }) => void;
  onError?: (error: string) => void;
}

export function NFCReader({ onScanSuccess, onError }: NFCReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const startReading = async () => {
    try {
      setIsReading(true);
      setError('');
      setStatus('Bring NFC tag or device near to scan...');

      const nfcData = await NFCService.readNFC();
      
      setStatus('NFC data read successfully!');
      onScanSuccess({
        shareToken: nfcData.shareToken,
        url: nfcData.url,
      });
      
      setIsReading(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to read NFC data';
      setError(errorMsg);
      setStatus('');
      onError?.(errorMsg);
      setIsReading(false);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setStatus('');
    setError('');
    // Note: Web NFC API doesn't have a direct stop method
    // The reading will stop when the component unmounts or when an error occurs
  };

  const platformInfo = NFCService.getPlatformInfo();

  if (!platformInfo.isNFCAvailable) {
    return (
      <div className="p-6 bg-navy-800/50 rounded-lg border border-navy-700">
        <p className="text-plum-300 text-sm mb-4">
          NFC is not available on this device.
        </p>
        <p className="text-plum-200 text-xs">
          Please use QR code scanning or manual code entry instead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-navy-800/50 rounded-lg border border-navy-700">
        {status && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">{status}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
            {error.includes('permission') && (
              <p className="text-red-200 text-xs mt-2">
                Please allow NFC access in your browser settings and try again.
              </p>
            )}
          </div>
        )}

        {!isReading && !status && (
          <div className="text-center">
            <p className="text-plum-200 text-sm mb-4">
              {platformInfo.isAndroid
                ? 'Tap "Start NFC Reader" and bring the customer\'s NFC-enabled device or tag near your phone.'
                : 'NFC reading is primarily supported on Android devices.'}
            </p>
          </div>
        )}

        {isReading && (
          <div className="text-center">
            <div className="inline-block animate-pulse mb-4">
              <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gold-400 text-sm font-semibold">
              Waiting for NFC tag...
            </p>
            <p className="text-plum-300 text-xs mt-2">
              Bring the NFC tag or device close to your phone
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isReading ? (
          <Button
            type="button"
            variant="gold"
            onClick={startReading}
            className="flex-1"
            disabled={!platformInfo.isNFCAvailable}
          >
            Start NFC Reader
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={stopReading}
            className="flex-1"
          >
            Stop Reading
          </Button>
        )}
      </div>

      {platformInfo.isAndroid && (
        <p className="text-xs text-plum-300 text-center">
          Make sure NFC is enabled in your device settings
        </p>
      )}
    </div>
  );
}

