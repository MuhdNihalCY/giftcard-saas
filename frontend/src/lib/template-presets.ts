/**
 * Template Presets
 * Quick-start templates for different business types
 */

import type { TemplateDesignData } from './template-design';

export interface TemplatePreset {
  name: string;
  description: string;
  category: string;
  designData: TemplateDesignData;
  preview: string; // Description of visual style
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    name: 'Business Professional',
    description: 'Clean and corporate design for professional services',
    category: 'Business',
    preview: 'Deep navy with gold accents, modern layout',
    designData: {
      colors: {
        primary: '#1a365d',
        secondary: '#2d3748',
        background: '#ffffff',
        text: '#1a202c',
        accent: '#d69e2e',
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        headingSize: '32px',
        bodySize: '16px',
        fontWeight: '700',
      },
      layout: 'modern',
      spacing: {
        padding: '32px',
        margin: '16px',
      },
      borderRadius: '16px',
      shadows: true,
    },
  },
  {
    name: 'Creative Agency',
    description: 'Vibrant and bold design for creative businesses',
    category: 'Creative',
    preview: 'Electric blue and magenta gradient, bold layout',
    designData: {
      colors: {
        primary: '#3b82f6',
        secondary: '#a855f7',
        background: '#faf5ff',
        text: '#1e1b4b',
        accent: '#ec4899',
      },
      typography: {
        fontFamily: 'Poppins, sans-serif',
        headingSize: '36px',
        bodySize: '16px',
        fontWeight: '700',
      },
      layout: 'bold',
      spacing: {
        padding: '28px',
        margin: '12px',
      },
      borderRadius: '20px',
      shadows: true,
    },
  },
  {
    name: 'Luxury Brand',
    description: 'Elegant and sophisticated design for premium brands',
    category: 'Luxury',
    preview: 'Royal purple with gold accents, premium layout',
    designData: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        background: '#faf5ff',
        text: '#581c87',
        accent: '#d69e2e',
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        headingSize: '34px',
        bodySize: '17px',
        fontWeight: '700',
      },
      layout: 'premium',
      spacing: {
        padding: '36px',
        margin: '18px',
      },
      borderRadius: '12px',
      shadows: true,
    },
  },
  {
    name: 'Tech Startup',
    description: 'Modern and minimalist design for tech companies',
    category: 'Technology',
    preview: 'Ocean blue gradient, minimal layout',
    designData: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        background: '#f0f9ff',
        text: '#0c4a6e',
        accent: '#0284c7',
      },
      typography: {
        fontFamily: 'Montserrat, sans-serif',
        headingSize: '30px',
        bodySize: '15px',
        fontWeight: '600',
      },
      layout: 'minimal',
      spacing: {
        padding: '24px',
        margin: '12px',
      },
      borderRadius: '12px',
      shadows: false,
    },
  },
  {
    name: 'Retail Store',
    description: 'Warm and inviting design for retail businesses',
    category: 'Retail',
    preview: 'Sunset coral and peach, classic layout',
    designData: {
      colors: {
        primary: '#f97316',
        secondary: '#fb923c',
        background: '#fff7ed',
        text: '#9a3412',
        accent: '#ea580c',
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        headingSize: '28px',
        bodySize: '16px',
        fontWeight: '600',
      },
      layout: 'classic',
      spacing: {
        padding: '28px',
        margin: '14px',
      },
      borderRadius: '14px',
      shadows: true,
    },
  },
  {
    name: 'Restaurant & Cafe',
    description: 'Cozy and warm design for food businesses',
    category: 'Food & Beverage',
    preview: 'Amber warmth, elegant layout',
    designData: {
      colors: {
        primary: '#d97706',
        secondary: '#f59e0b',
        background: '#fffbeb',
        text: '#78350f',
        accent: '#fbbf24',
      },
      typography: {
        fontFamily: 'Merriweather, serif',
        headingSize: '32px',
        bodySize: '16px',
        fontWeight: '700',
      },
      layout: 'elegant',
      spacing: {
        padding: '30px',
        margin: '15px',
      },
      borderRadius: '18px',
      shadows: true,
    },
  },
  {
    name: 'Wellness & Spa',
    description: 'Calming and natural design for wellness businesses',
    category: 'Wellness',
    preview: 'Forest green, minimal layout',
    designData: {
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        background: '#f0fdf4',
        text: '#065f46',
        accent: '#059669',
      },
      typography: {
        fontFamily: 'Open Sans, sans-serif',
        headingSize: '30px',
        bodySize: '16px',
        fontWeight: '600',
      },
      layout: 'minimal',
      spacing: {
        padding: '26px',
        margin: '13px',
      },
      borderRadius: '16px',
      shadows: false,
    },
  },
  {
    name: 'Fashion & Beauty',
    description: 'Elegant rose gold design for fashion brands',
    category: 'Fashion',
    preview: 'Rose gold with elegant typography',
    designData: {
      colors: {
        primary: '#e11d48',
        secondary: '#f43f5e',
        background: '#fff1f2',
        text: '#9f1239',
        accent: '#d69e2e',
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        headingSize: '34px',
        bodySize: '17px',
        fontWeight: '700',
      },
      layout: 'elegant',
      spacing: {
        padding: '32px',
        margin: '16px',
      },
      borderRadius: '14px',
      shadows: true,
    },
  },
];

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): TemplatePreset[] {
  return TEMPLATE_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(TEMPLATE_PRESETS.map((preset) => preset.category)));
}

