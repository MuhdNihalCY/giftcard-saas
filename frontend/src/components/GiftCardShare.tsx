'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import QRCode from 'react-qr-code';
import NFCService from '@/services/nfc.service';
import api from '@/lib/api';
import logger from '@/lib/logger';
import type { ShareData } from '@/types/share';

interface GiftCardShareProps {
  giftCardId: string;
  onClose?: () => void;
}

export function GiftCardShare({ giftCardId, onClose }: GiftCardShareProps) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isWritingNFC, setIsWritingNFC] = useState(false);
  const [copied, setCopied] = useState(false);

  const platformInfo = NFCService.getPlatformInfo();

  useEffect(() => {
    generateShareToken();
  }, [giftCardId]);

  const generateShareToken = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post(`/gift-card-share/${giftCardId}/generate-token`);
      setShareData(response.data.data);

      // Also get NFC data if NFC is available
      if (platformInfo.isNFCAvailable && platformInfo.isAndroid) {
        try {
          const nfcResponse = await api.get(`/gift-card-share/${giftCardId}/nfc-data`);
          setShareData((prev) => ({
            ...prev!,
            nfcData: nfcResponse.data.data,
          }));
        } catch (err: unknown) {
          // NFC data fetch failed, but continue with share token
          logger.warn('Failed to fetch NFC data', { 
            error: err instanceof Error ? err.message : String(err), 
            giftCardId 
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate share token');
    } finally {
      setIsLoading(false);
    }
  };

  const writeToNFC = async () => {
    if (!shareData?.nfcData) {
      setError('NFC data not available');
      return;
    }

    try {
      setIsWritingNFC(true);
      setError('');

      await NFCService.writeNFC(shareData.nfcData);
      setError(''); // Clear any previous errors
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write to NFC';
      setError(errorMessage);
    } finally {
      setIsWritingNFC(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareData?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-plum-300">Generating share link...</div>
        </CardContent>
      </Card>
    );
  }

  if (!shareData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-300">
            {error || 'Failed to generate share data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Gift Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* NFC Write (Android only) */}
        {platformInfo.isNFCAvailable && platformInfo.isAndroid && shareData.nfcData && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Share via NFC</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Write gift card data to an NFC tag. The recipient can then scan the tag with their phone.
            </p>
            <Button
              variant="primary"
              onClick={writeToNFC}
              isLoading={isWritingNFC}
              className="w-full"
            >
              {isWritingNFC ? 'Writing to NFC...' : 'Write to NFC Tag'}
            </Button>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Hold your phone near an NFC tag and tap the button above
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Share via QR Code</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Scan this QR code to view the gift card
          </p>
          <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded-lg">
            <QRCode
              value={shareData.shareUrl}
              size={200}
              level="H"
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Share via Link</h4>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareData.shareUrl}
              className="flex-1 px-4 py-2 border-2 border-navy-600 rounded-lg bg-navy-800/50 text-navy-50 text-sm"
            />
            <Button
              variant="outline"
              onClick={copyShareLink}
              className="whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-plum-300">
            Share this link with anyone to let them view the gift card
          </p>
        </div>

        {/* Platform Info */}
        {!platformInfo.isNFCAvailable && (
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> NFC is not available on this device. Use QR code or share link instead.
            </p>
          </div>
        )}

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

