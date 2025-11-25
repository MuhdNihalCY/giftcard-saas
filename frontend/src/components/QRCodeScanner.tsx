'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/Button';
import logger from '@/lib/logger';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRCodeScanner({ onScanSuccess, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    try {
      setError('');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Try to get available cameras
      const cameras = await Html5Qrcode.getCameras();
      
      // Prefer back camera on mobile, or first available camera
      let cameraId: string | { facingMode: string };
      if (cameras.length > 0) {
        // Try to find back camera first
        const backCamera = cameras.find(cam => cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('rear'));
        cameraId = backCamera ? backCamera.id : cameras[0].id;
      } else {
        // Fallback to facingMode
        cameraId = { facingMode: 'environment' };
      }

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Successfully scanned
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent while scanning)
          // Only log if it's not a "not found" error
          if (!errorMessage.includes('NotFoundException')) {
            // Silent - these are expected during scanning
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      let errorMsg = err.message || 'Failed to start camera';
      
      // Provide more helpful error messages
      if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')) {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('DevicesNotFoundError')) {
        errorMsg = 'No camera found. Please ensure your device has a camera and it is not being used by another application.';
      } else if (errorMsg.includes('NotReadableError')) {
        errorMsg = 'Camera is already in use by another application. Please close other applications using the camera.';
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        logger.error('Error stopping scanner', { error: err });
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch((err) => {
          logger.error('Error stopping scanner on unmount', { error: err });
        });
      }
    };
  }, [isScanning]);

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className={`w-full rounded-lg overflow-hidden ${
          isScanning ? 'min-h-[300px]' : 'min-h-[200px] bg-navy-800/50'
        }`}
      />

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
          {error.includes('Permission') && (
            <p className="mt-2 text-xs">
              Please allow camera access in your browser settings and try again.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {!isScanning ? (
          <Button
            type="button"
            variant="gold"
            onClick={startScanning}
            className="flex-1"
          >
            Start Scanner
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={stopScanning}
            className="flex-1"
          >
            Stop Scanner
          </Button>
        )}
      </div>

      {!isScanning && (
        <p className="text-xs text-plum-300 text-center">
          Click "Start Scanner" to scan a QR code from a customer's gift card
        </p>
      )}
    </div>
  );
}

