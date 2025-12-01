'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { applyTemplateStyles, getBackgroundGradient, getContrastTextColor, mergeDesignWithDefaults, getLayoutStyles } from '@/lib/template-design';
import { formatCurrency } from '@/lib/utils';

interface TemplatePreviewProps {
  designData: any;
}

export function TemplatePreview({ designData }: TemplatePreviewProps) {
  const design = mergeDesignWithDefaults(designData);
  const baseStyles = applyTemplateStyles(designData);
  const layoutStyles = getLayoutStyles(designData);
  const gradient = getBackgroundGradient(designData);
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

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h3 className="text-xl font-bold text-plum-300">Live Preview</h3>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-lg overflow-hidden border-2"
          style={{
            borderColor: design.colors.primary,
            ...cardStyle,
          }}
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

          {/* Header */}
          <div
            className="relative z-10 p-6"
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
              borderBottom: design.layout === 'minimal' ? `1px solid ${design.colors.primary}20` : 'none',
            }}
          >
            <div className="flex items-center justify-center gap-4">
              {design.images?.logo && (
                <img
                  src={design.images.logo}
                  alt="Logo"
                  className="w-16 h-16 rounded-lg object-cover"
                  style={{ maxHeight: '64px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
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
                  Sample Merchant
                </h2>
                <p className="text-sm opacity-90">Gift Card</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="relative z-10 p-6 space-y-4"
            style={{
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
                {formatCurrency(100, 'USD')}
              </p>
              <p
                className="text-sm mt-2 opacity-70"
                style={{ color: design.colors.text }}
              >
                Original Value: {formatCurrency(100, 'USD')}
              </p>
            </div>

            {/* Sample Code */}
            <div className="text-center">
              <p
                className="text-sm mb-2 opacity-80"
                style={{ color: design.colors.text }}
              >
                Gift Card Code
              </p>
              <p
                className="font-mono font-semibold text-lg"
                style={{ color: design.colors.primary }}
              >
                SAMPLE-CODE-1234
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

