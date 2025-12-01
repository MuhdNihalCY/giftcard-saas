/**
 * Template Design Utilities
 * Utilities for working with gift card template design data
 */

import type { TemplateDesignData } from '../services/giftcard-template.service';

export interface DefaultDesignData extends Required<TemplateDesignData> {
  colors: Required<NonNullable<TemplateDesignData['colors']>>;
  typography: Required<NonNullable<TemplateDesignData['typography']>>;
  spacing: Required<NonNullable<TemplateDesignData['spacing']>>;
}

/**
 * Default design data used as fallback
 */
export const DEFAULT_DESIGN_DATA: DefaultDesignData = {
  colors: {
    primary: '#1a365d',      // Deep navy - professional and modern
    secondary: '#2d3748',    // Charcoal - sophisticated
    background: '#ffffff',   // Pure white - clean
    text: '#1a202c',         // Dark gray - excellent readability
    accent: '#d69e2e',       // Gold accent - premium feel
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingSize: '32px',
    bodySize: '16px',
    fontWeight: '700',
  },
  images: {},
  layout: 'modern',
  spacing: {
    padding: '32px',
    margin: '16px',
  },
  borderRadius: '16px',
  shadows: true,
};

/**
 * Merge template design data with defaults
 */
export function mergeDesignWithDefaults(
  designData?: TemplateDesignData | null
): DefaultDesignData {
  if (!designData) {
    return DEFAULT_DESIGN_DATA;
  }

  return {
    colors: {
      ...DEFAULT_DESIGN_DATA.colors,
      ...(designData.colors || {}),
    },
    typography: {
      ...DEFAULT_DESIGN_DATA.typography,
      ...(designData.typography || {}),
    },
    images: {
      ...(designData.images || {}),
    },
    layout: designData.layout || DEFAULT_DESIGN_DATA.layout,
    spacing: {
      ...DEFAULT_DESIGN_DATA.spacing,
      ...(designData.spacing || {}),
    },
    borderRadius: designData.borderRadius || DEFAULT_DESIGN_DATA.borderRadius,
    shadows: designData.shadows !== undefined ? designData.shadows : DEFAULT_DESIGN_DATA.shadows,
  };
}

/**
 * Extract colors from template design data
 */
export function extractColors(designData?: TemplateDesignData | null) {
  const merged = mergeDesignWithDefaults(designData);
  return merged.colors;
}

/**
 * Generate CSS styles from template design data
 */
export function generateCSSStyles(designData?: TemplateDesignData | null): string {
  const merged = mergeDesignWithDefaults(designData);
  
  const styles: string[] = [];
  
  // Colors
  if (merged.colors.primary) {
    styles.push(`--color-primary: ${merged.colors.primary};`);
  }
  if (merged.colors.secondary) {
    styles.push(`--color-secondary: ${merged.colors.secondary};`);
  }
  if (merged.colors.background) {
    styles.push(`--color-background: ${merged.colors.background};`);
  }
  if (merged.colors.text) {
    styles.push(`--color-text: ${merged.colors.text};`);
  }
  if (merged.colors.accent) {
    styles.push(`--color-accent: ${merged.colors.accent};`);
  }
  
  // Typography
  if (merged.typography.fontFamily) {
    styles.push(`--font-family: ${merged.typography.fontFamily};`);
  }
  if (merged.typography.headingSize) {
    styles.push(`--heading-size: ${merged.typography.headingSize};`);
  }
  if (merged.typography.bodySize) {
    styles.push(`--body-size: ${merged.typography.bodySize};`);
  }
  if (merged.typography.fontWeight) {
    styles.push(`--font-weight: ${merged.typography.fontWeight};`);
  }
  
  // Spacing
  if (merged.spacing.padding) {
    styles.push(`--padding: ${merged.spacing.padding};`);
  }
  if (merged.spacing.margin) {
    styles.push(`--margin: ${merged.spacing.margin};`);
  }
  
  // Border radius
  if (merged.borderRadius) {
    styles.push(`--border-radius: ${merged.borderRadius};`);
  }
  
  // Shadows
  if (merged.shadows) {
    styles.push(`--box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);`);
  }
  
  return styles.join(' ');
}

/**
 * Generate inline styles object for React/HTML
 */
export function generateInlineStyles(designData?: TemplateDesignData | null): Record<string, string> {
  const merged = mergeDesignWithDefaults(designData);
  
  const styles: Record<string, string> = {};
  
  // Colors
  if (merged.colors.primary) {
    styles['--color-primary'] = merged.colors.primary;
  }
  if (merged.colors.secondary) {
    styles['--color-secondary'] = merged.colors.secondary;
  }
  if (merged.colors.background) {
    styles.backgroundColor = merged.colors.background;
  }
  if (merged.colors.text) {
    styles.color = merged.colors.text;
  }
  if (merged.colors.accent) {
    styles['--color-accent'] = merged.colors.accent;
  }
  
  // Typography
  if (merged.typography.fontFamily) {
    styles.fontFamily = merged.typography.fontFamily;
  }
  if (merged.typography.headingSize) {
    styles['--heading-size'] = merged.typography.headingSize;
  }
  if (merged.typography.bodySize) {
    styles.fontSize = merged.typography.bodySize;
  }
  if (merged.typography.fontWeight) {
    styles.fontWeight = merged.typography.fontWeight;
  }
  
  // Spacing
  if (merged.spacing.padding) {
    styles.padding = merged.spacing.padding;
  }
  if (merged.spacing.margin) {
    styles.margin = merged.spacing.margin;
  }
  
  // Border radius
  if (merged.borderRadius) {
    styles.borderRadius = merged.borderRadius;
  }
  
  // Shadows
  if (merged.shadows) {
    styles.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }
  
  return styles;
}

/**
 * Validate design data structure
 */
export function validateDesignData(designData: any): designData is TemplateDesignData {
  if (!designData || typeof designData !== 'object') {
    return false;
  }
  
  // Colors validation
  if (designData.colors && typeof designData.colors !== 'object') {
    return false;
  }
  
  // Typography validation
  if (designData.typography && typeof designData.typography !== 'object') {
    return false;
  }
  
  // Images validation
  if (designData.images && typeof designData.images !== 'object') {
    return false;
  }
  
  // Layout validation
  if (designData.layout && !['classic', 'card', 'minimal', 'premium', 'modern', 'bold', 'elegant', 'default'].includes(designData.layout)) {
    return false;
  }
  
  return true;
}

/**
 * Get background gradient from template colors
 */
export function getBackgroundGradient(designData?: TemplateDesignData | null): string {
  const merged = mergeDesignWithDefaults(designData);
  return `linear-gradient(135deg, ${merged.colors.primary} 0%, ${merged.colors.secondary} 100%)`;
}

/**
 * Get text color that contrasts with background
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Simple contrast calculation - if background is dark, use light text
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

