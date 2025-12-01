'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { applyTemplateStyles, getBackgroundGradient, getContrastTextColor, mergeDesignWithDefaults, getLayoutStyles } from '@/lib/template-design';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'react-qr-code';

export interface GiftCardDisplayProps {
  giftCard: {
    id: string;
    code: string;
    value: number;
    balance: number;
    currency: string;
    status: string;
    expiryDate?: string | Date | null;
    customMessage?: string | null;
    recipientName?: string | null;
    qrCodeUrl?: string | null;
    merchant: {
      id: string;
      businessName: string | null;
      businessLogo?: string | null;
    };
    template?: {
      designData: any;
    } | null;
  };
  showQRCode?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function GiftCardDisplay({
  giftCard,
  showQRCode = true,
  showDetails = true,
  className = '',
}: GiftCardDisplayProps) {
  const design = mergeDesignWithDefaults(giftCard.template?.designData);
  const baseStyles = applyTemplateStyles(giftCard.template?.designData);
  const layoutStyles = getLayoutStyles(giftCard.template?.designData);
  const gradient = getBackgroundGradient(giftCard.template?.designData);
  const contrastText = getContrastTextColor(design.colors.primary);

  // Determine background and text color based on layout
  let background: string;
  let textColor: string;
  
  switch (design.layout) {
    case 'premium':
    case 'modern':
      background = gradient;
      textColor = contrastText;
      break;
    case 'bold':
      background = design.colors.primary;
      textColor = contrastText;
      break;
    case 'minimal':
      background = design.colors.background;
      textColor = design.colors.text;
      break;
    case 'classic':
    case 'elegant':
    default:
      background = design.colors.background;
      textColor = design.colors.text;
      break;
  }

  const cardStyle: React.CSSProperties = {
    ...baseStyles,
    ...layoutStyles,
    background,
    color: textColor,
    position: 'relative',
    overflow: 'hidden',
  };

  const qrData = JSON.stringify({ code: giftCard.code, id: giftCard.id });

  return (
    <Card 
      className={`gift-card-display ${className}`}
      style={cardStyle}
    >
      {/* Background pattern if available */}
      {design.images?.pattern && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${design.images.pattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <CardHeader
        className="relative z-10"
        style={{
          background: 
            design.layout === 'premium' || design.layout === 'modern' || design.layout === 'bold'
              ? 'transparent'
              : design.layout === 'minimal'
              ? 'transparent'
              : `linear-gradient(135deg, ${design.colors.primary} 0%, ${design.colors.secondary} 100%)`,
          color: 
            design.layout === 'premium' || design.layout === 'modern' || design.layout === 'bold'
              ? contrastText
              : design.layout === 'minimal'
              ? design.colors.text
              : '#ffffff',
          padding: design.spacing.padding,
          borderRadius: `${design.borderRadius} ${design.borderRadius} 0 0`,
          borderBottom: design.layout === 'minimal' ? `1px solid ${design.colors.primary}20` : 'none',
        }}
      >
        <div className="flex items-center justify-center gap-4">
          {design.images?.logo && (
            <img
              src={design.images.logo}
              alt={giftCard.merchant.businessName || 'Logo'}
              className="w-16 h-16 rounded-lg object-cover"
              style={{ maxHeight: '64px' }}
            />
          )}
          {giftCard.merchant.businessLogo && !design.images?.logo && (
            <img
              src={giftCard.merchant.businessLogo}
              alt={giftCard.merchant.businessName || 'Logo'}
              className="w-16 h-16 rounded-lg object-cover"
              style={{ maxHeight: '64px' }}
            />
          )}
          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                fontSize: design.typography.headingSize,
                fontFamily: design.typography.fontFamily,
                fontWeight: design.typography.fontWeight,
              }}
            >
              {giftCard.merchant.businessName || 'Gift Card'}
            </h2>
            <p className="text-sm opacity-90">Gift Card</p>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className="relative z-10 space-y-6"
        style={{
          padding: design.spacing.padding,
          background: 
            design.layout === 'premium' || design.layout === 'modern' || design.layout === 'bold'
              ? 'transparent'
              : design.colors.background,
        }}
      >
            {/* Balance Display */}
            <div
              className="text-center py-6 rounded-lg border-2"
              style={{
                borderStyle: design.layout === 'elegant' ? 'solid' : 'dashed',
                borderColor: design.colors.primary,
                borderRadius: design.borderRadius,
                background: 
                  design.layout === 'premium' || design.layout === 'modern' || design.layout === 'bold'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : design.colors.background === '#ffffff'
                    ? '#f9f9f9'
                    : 'rgba(255, 255, 255, 0.1)',
                boxShadow: design.layout === 'premium' ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
              }}
            >
          <p
            className="text-sm mb-2 opacity-80"
            style={{ color: design.colors.text }}
          >
            Current Balance
          </p>
          <p
            className="text-4xl font-bold"
            style={{
              color: design.colors.primary,
              fontSize: design.typography.headingSize,
              fontFamily: design.typography.fontFamily,
            }}
          >
            {formatCurrency(giftCard.balance, giftCard.currency)}
          </p>
          <p
            className="text-sm mt-2 opacity-70"
            style={{ color: design.colors.text }}
          >
            Original Value: {formatCurrency(giftCard.value, giftCard.currency)}
          </p>
        </div>

        {/* Custom Message */}
        {giftCard.customMessage && (
          <div
            className="text-center italic py-4"
            style={{
              color: design.colors.text,
              opacity: 0.8,
              fontSize: design.typography.bodySize,
            }}
          >
            "{giftCard.customMessage}"
          </div>
        )}

        {/* QR Code */}
        {showQRCode && (
          <div
            className="flex justify-center p-6 rounded-lg"
            style={{
              background: design.colors.background === '#ffffff'
                ? '#f9f9f9'
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: design.borderRadius,
            }}
          >
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={qrData}
                size={200}
                level="H"
                fgColor={design.colors.primary}
                bgColor="#FFFFFF"
              />
            </div>
          </div>
        )}

        {/* Details */}
        {showDetails && (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: design.colors.text, opacity: 0.2 }}>
              <span style={{ color: design.colors.text, opacity: 0.8 }}>Card Code:</span>
              <span
                className="font-mono font-semibold"
                style={{ color: design.colors.text }}
              >
                {giftCard.code}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: design.colors.text, opacity: 0.2 }}>
              <span style={{ color: design.colors.text, opacity: 0.8 }}>Status:</span>
              <span
                className={`font-semibold ${
                  giftCard.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {giftCard.status}
              </span>
            </div>
            {giftCard.expiryDate && (
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: design.colors.text, opacity: 0.2 }}>
                <span style={{ color: design.colors.text, opacity: 0.8 }}>Expires:</span>
                <span style={{ color: design.colors.text }}>
                  {formatDate(giftCard.expiryDate)}
                </span>
              </div>
            )}
            {giftCard.recipientName && (
              <div className="flex justify-between items-center py-2">
                <span style={{ color: design.colors.text, opacity: 0.8 }}>Recipient:</span>
                <span style={{ color: design.colors.text }}>
                  {giftCard.recipientName}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

