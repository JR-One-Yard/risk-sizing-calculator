/**
 * Credit Suisse Theme Type Definitions
 * TypeScript types for CSS custom properties and design tokens
 */

/**
 * Credit Suisse Brand Colors
 */
export interface CreditSuisseBrandColors {
  /** Deep Navy - Primary brand color (#003662) */
  brand: string;
  /** Near-black - Primary text on brand (#0b2239) */
  brandInk: string;
  /** Light Blue Wash - Subtle backgrounds (#e6eef6) */
  brandTint: string;
}

/**
 * Neutral Colors
 */
export interface NeutralColors {
  /** Pure white - Main background (#ffffff) */
  bg: string;
  /** Light gray - Card backgrounds (#f5f7fa) */
  bgMuted: string;
  /** Dark text - Primary text (#14202b) */
  ink: string;
  /** Secondary text - Labels, captions (#4a5a6a) */
  inkMuted: string;
}

/**
 * Border Colors
 */
export interface BorderColors {
  /** Default borders (#ccd7e2) */
  border: string;
  /** Emphasized borders (#9fb3c8) */
  borderStrong: string;
  /** Focus rings and active states (#2b6da8) */
  focus: string;
}

/**
 * Status Colors with backgrounds
 */
export interface StatusColors {
  /** Success text color (#2e7d32) */
  success: string;
  /** Success background (#e8f5e9) */
  successBg: string;
  /** Success border (#81c784) */
  successBorder: string;

  /** Warning text color (#f57c00) */
  warning: string;
  /** Warning background (#fff8e1) */
  warningBg: string;
  /** Warning border (#ffb74d) */
  warningBorder: string;

  /** Error text color (#c62828) */
  error: string;
  /** Error background (#ffebee) */
  errorBg: string;
  /** Error border (#e57373) */
  errorBorder: string;

  /** Info text color (#2b6da8) */
  info: string;
  /** Info background (#e3f2fd) */
  infoBg: string;
  /** Info border (#64b5f6) */
  infoBorder: string;
}

/**
 * Risk Level Colors
 */
export interface RiskColors {
  /** Green - Low risk (#2e7d32) */
  safe: string;
  /** Orange - Medium risk (#f57c00) */
  caution: string;
  /** Red - High risk (#c62828) */
  warning: string;
}

/**
 * Volatility Colors (Muted Scale)
 */
export interface VolatilityColors {
  /** Brand navy - Very stable (#003662) */
  ultraLow: string;
  /** Mid blue - Stable (#2b6da8) */
  low: string;
  /** Gray - Moderate (#6b7280) */
  medium: string;
  /** Orange - Volatile (#f57c00) */
  high: string;
  /** Red - Very volatile (#c62828) */
  ultraHigh: string;
}

/**
 * Typography Settings
 */
export interface Typography {
  /** Primary font family (Helvetica Neue) */
  fontSans: string;
  /** Monospace font family (Monaco) */
  fontMono: string;

  /** Normal font weight (400) */
  fontNormal: number;
  /** Semibold font weight (600) */
  fontSemibold: number;
  /** Bold font weight (700) */
  fontBold: number;

  /** Tight line height (1.25) */
  lineHeightTight: number;
  /** Normal line height (1.5) */
  lineHeightNormal: number;
  /** Relaxed line height (1.75) */
  lineHeightRelaxed: number;

  /** Letter spacing (-0.01em) */
  letterSpacing: string;
}

/**
 * Spacing Scale (Increased 33% for professional look)
 */
export interface Spacing {
  /** 8px */
  xs: string;
  /** 16px */
  sm: string;
  /** 24px */
  md: string;
  /** 32px (increased from 24px) */
  lg: string;
  /** 40px */
  xl: string;
  /** 48px */
  '2xl': string;

  /** Card padding horizontal: 32px (was 24px) */
  cardPaddingX: string;
  /** Card padding vertical: 20px (was 16px) */
  cardPaddingY: string;

  /** Form field gap: 24px (was 16px) */
  formGap: string;

  /** Section gap: 32px (was 24px) */
  sectionGap: string;
}

/**
 * Border Radius
 */
export interface BorderRadius {
  /** Small elements (6px) */
  sm: string;
  /** Standard radius (10px) */
  md: string;
  /** Large cards (12px) */
  lg: string;
  /** Pills and circles (9999px) */
  full: string;
}

/**
 * Box Shadows (Minimized for professional look)
 */
export interface Shadows {
  /** No shadow */
  none: string;
  /** Very subtle (0.03 opacity) */
  sm: string;
  /** Reduced (0.05 opacity) */
  md: string;
  /** Reduced (0.07 opacity) */
  lg: string;
  /** Focus ring */
  focus: string;
}

/**
 * Transition Timings
 */
export interface Transitions {
  /** 150ms ease */
  fast: string;
  /** 200ms ease */
  base: string;
  /** 300ms ease */
  slow: string;
}

/**
 * Z-Index Scale
 */
export interface ZIndex {
  /** Base: 0 */
  base: number;
  /** Dropdown: 1000 */
  dropdown: number;
  /** Sticky: 1100 */
  sticky: number;
  /** Modal backdrop: 1200 */
  modalBackdrop: number;
  /** Modal: 1300 */
  modal: number;
  /** Tooltip: 1400 */
  tooltip: number;
}

/**
 * Complete Credit Suisse Theme Interface
 */
export interface CreditSuisseTheme {
  colors: {
    brand: CreditSuisseBrandColors;
    neutral: NeutralColors;
    border: BorderColors;
    status: StatusColors;
    risk: RiskColors;
    volatility: VolatilityColors;
  };
  typography: Typography;
  spacing: Spacing;
  radius: BorderRadius;
  shadows: Shadows;
  transitions: Transitions;
  zIndex: ZIndex;
}

/**
 * Tailwind Color Utilities
 * Maps to Tailwind classes like bg-brand, text-brand-ink, etc.
 */
export type TailwindBrandColor =
  | 'brand'
  | 'brand-ink'
  | 'brand-tint'
  | 'bg'
  | 'bg-muted'
  | 'ink'
  | 'ink-muted';

export type TailwindStatusColor =
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type TailwindRiskColor =
  | 'risk-safe'
  | 'risk-caution'
  | 'risk-warning';

export type TailwindVolatilityColor =
  | 'vol-ultra-low'
  | 'vol-low'
  | 'vol-medium'
  | 'vol-high'
  | 'vol-ultra-high';

/**
 * All Credit Suisse colors available as Tailwind utilities
 */
export type CreditSuisseColor =
  | TailwindBrandColor
  | TailwindStatusColor
  | TailwindRiskColor
  | TailwindVolatilityColor;

/**
 * Augment CSS Properties with Credit Suisse theme variables
 */
declare module 'react' {
  interface CSSProperties {
    '--cs-brand'?: string;
    '--cs-brand-ink'?: string;
    '--cs-brand-tint'?: string;
    '--cs-bg'?: string;
    '--cs-bg-muted'?: string;
    '--cs-ink'?: string;
    '--cs-ink-muted'?: string;
    '--cs-border'?: string;
    '--cs-border-strong'?: string;
    '--cs-focus'?: string;
    '--cs-success'?: string;
    '--cs-warning'?: string;
    '--cs-error'?: string;
    '--cs-info'?: string;
  }
}
