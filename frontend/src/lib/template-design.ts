/**
 * Frontend Template Design Utilities
 * Utilities for applying template design data in React components
 */

export interface TemplateDesignData {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    accent?: string;
  };
  typography?: {
    fontFamily?: string;
    headingSize?: string;
    bodySize?: string;
    fontWeight?: string;
  };
  images?: {
    logo?: string;
    background?: string;
    pattern?: string;
  };
  layout?: 'classic' | 'card' | 'minimal' | 'premium' | 'modern' | 'bold' | 'elegant' | 'default';
  spacing?: {
    padding?: string;
    margin?: string;
  };
  borderRadius?: string;
  shadows?: boolean;
}

/**
 * Default design data
 */
const DEFAULT_DESIGN: Required<TemplateDesignData> = {
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
 * Merge template design with defaults
 */
export function mergeDesignWithDefaults(
  designData?: TemplateDesignData | null
): Required<TemplateDesignData> {
  if (!designData) {
    return DEFAULT_DESIGN;
  }

  return {
    colors: {
      ...DEFAULT_DESIGN.colors,
      ...(designData.colors || {}),
    },
    typography: {
      ...DEFAULT_DESIGN.typography,
      ...(designData.typography || {}),
    },
    images: {
      ...(designData.images || {}),
    },
    layout: designData.layout || DEFAULT_DESIGN.layout,
    spacing: {
      ...DEFAULT_DESIGN.spacing,
      ...(designData.spacing || {}),
    },
    borderRadius: designData.borderRadius || DEFAULT_DESIGN.borderRadius,
    shadows: designData.shadows !== undefined ? designData.shadows : DEFAULT_DESIGN.shadows,
  };
}

/**
 * Convert template designData to CSS variables
 */
export function designToCSSVariables(designData?: TemplateDesignData | null): Record<string, string> {
  const merged = mergeDesignWithDefaults(designData);
  
  return {
    '--template-color-primary': merged.colors.primary,
    '--template-color-secondary': merged.colors.secondary,
    '--template-color-background': merged.colors.background,
    '--template-color-text': merged.colors.text,
    '--template-color-accent': merged.colors.accent,
    '--template-font-family': merged.typography.fontFamily,
    '--template-heading-size': merged.typography.headingSize,
    '--template-body-size': merged.typography.bodySize,
    '--template-font-weight': merged.typography.fontWeight,
    '--template-padding': merged.spacing.padding,
    '--template-margin': merged.spacing.margin,
    '--template-border-radius': merged.borderRadius,
    '--template-box-shadow': merged.shadows ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
  };
}

/**
 * Generate inline styles from template
 */
export function generateInlineStyles(designData?: TemplateDesignData | null): React.CSSProperties {
  const merged = mergeDesignWithDefaults(designData);
  
  const styles: React.CSSProperties = {
    ...designToCSSVariables(designData),
    backgroundColor: merged.colors.background,
    color: merged.colors.text,
    fontFamily: merged.typography.fontFamily,
    fontSize: merged.typography.bodySize,
    fontWeight: merged.typography.fontWeight,
    padding: merged.spacing.padding,
    margin: merged.spacing.margin,
    borderRadius: merged.borderRadius,
    boxShadow: merged.shadows ? '0 4px 6px rgba(0, 0, 0, 0.1)' : undefined,
  };
  
  return styles;
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
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Apply template styles to a React component
 */
export function applyTemplateStyles(
  designData?: TemplateDesignData | null,
  additionalStyles?: React.CSSProperties
): React.CSSProperties {
  const baseStyles = generateInlineStyles(designData);
  return {
    ...baseStyles,
    ...additionalStyles,
  };
}

/**
 * Get template class name based on layout
 */
export function getTemplateLayoutClass(layout?: string): string {
  switch (layout) {
    case 'classic':
      return 'template-layout-classic';
    case 'card':
      return 'template-layout-card';
    case 'minimal':
      return 'template-layout-minimal';
    case 'premium':
      return 'template-layout-premium';
    case 'modern':
      return 'template-layout-modern';
    case 'bold':
      return 'template-layout-bold';
    case 'elegant':
      return 'template-layout-elegant';
    default:
      return 'template-layout-modern';
  }
}

/**
 * Get layout-specific styles
 */
export function getLayoutStyles(designData?: TemplateDesignData | null): React.CSSProperties {
  const merged = mergeDesignWithDefaults(designData);
  const layout = merged.layout;
  const styles: React.CSSProperties = {};

  switch (layout) {
    case 'classic':
      styles.border = `3px solid ${merged.colors.primary}`;
      styles.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
      break;
    case 'modern':
      styles.background = getBackgroundGradient(designData);
      styles.color = getContrastTextColor(merged.colors.primary);
      styles.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      break;
    case 'minimal':
      styles.background = merged.colors.background;
      styles.border = `1px solid ${merged.colors.primary}20`;
      styles.boxShadow = 'none';
      break;
    case 'premium':
      styles.background = `linear-gradient(135deg, ${merged.colors.primary} 0%, ${merged.colors.secondary} 100%)`;
      styles.color = getContrastTextColor(merged.colors.primary);
      styles.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      break;
    case 'bold':
      styles.background = merged.colors.primary;
      styles.color = getContrastTextColor(merged.colors.primary);
      styles.border = `4px solid ${merged.colors.accent}`;
      styles.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
      break;
    case 'elegant':
      styles.background = merged.colors.background;
      styles.border = `2px solid ${merged.colors.primary}40`;
      styles.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      break;
    default:
      styles.background = getBackgroundGradient(designData);
      styles.color = getContrastTextColor(merged.colors.primary);
  }

  return styles;
}

