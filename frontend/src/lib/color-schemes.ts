/**
 * Professional Color Scheme Presets
 * Ready-to-use color palettes for gift card templates
 */

import type { TemplateDesignData } from './template-design';

export interface ColorScheme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  preview: string; // CSS gradient or color for preview
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    name: 'Ocean Breeze',
    description: 'Fresh and calming teal palette',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#0284c7',
    },
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  },
  {
    name: 'Sunset Glow',
    description: 'Warm coral and peach tones',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#fff7ed',
      text: '#9a3412',
      accent: '#ea580c',
    },
    preview: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
  },
  {
    name: 'Forest Green',
    description: 'Natural emerald and sage',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#f0fdf4',
      text: '#065f46',
      accent: '#059669',
    },
    preview: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  {
    name: 'Royal Purple',
    description: 'Luxurious deep purple with gold',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      background: '#faf5ff',
      text: '#581c87',
      accent: '#d69e2e',
    },
    preview: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  },
  {
    name: 'Midnight Blue',
    description: 'Professional navy and sky blue',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      background: '#eff6ff',
      text: '#1e3a8a',
      accent: '#60a5fa',
    },
    preview: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  },
  {
    name: 'Rose Gold',
    description: 'Elegant rose with gold accents',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      background: '#fff1f2',
      text: '#9f1239',
      accent: '#d69e2e',
    },
    preview: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
  },
  {
    name: 'Modern Monochrome',
    description: 'Sophisticated charcoal and gray',
    colors: {
      primary: '#1f2937',
      secondary: '#4b5563',
      background: '#ffffff',
      text: '#111827',
      accent: '#6b7280',
    },
    preview: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
  },
  {
    name: 'Vibrant',
    description: 'Bold electric blue and magenta',
    colors: {
      primary: '#3b82f6',
      secondary: '#a855f7',
      background: '#faf5ff',
      text: '#1e1b4b',
      accent: '#ec4899',
    },
    preview: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
  },
  {
    name: 'Emerald Luxury',
    description: 'Premium emerald with gold',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      background: '#ecfdf5',
      text: '#064e3b',
      accent: '#d69e2e',
    },
    preview: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  {
    name: 'Amber Warmth',
    description: 'Cozy amber and orange',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      background: '#fffbeb',
      text: '#78350f',
      accent: '#fbbf24',
    },
    preview: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
  {
    name: 'Sapphire Elegance',
    description: 'Deep blue with silver accents',
    colors: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      background: '#eff6ff',
      text: '#1e40af',
      accent: '#94a3b8',
    },
    preview: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
  },
  {
    name: 'Crimson Bold',
    description: 'Strong red with dark accents',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      background: '#fef2f2',
      text: '#991b1b',
      accent: '#b91c1c',
    },
    preview: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
  },
];

/**
 * Apply a color scheme to template design data
 */
export function applyColorScheme(
  scheme: ColorScheme,
  currentDesign: TemplateDesignData
): TemplateDesignData {
  return {
    ...currentDesign,
    colors: {
      ...scheme.colors,
    },
  };
}

