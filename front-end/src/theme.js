// Enhanced Style Guide Constants

export const theme = {
  colors: {
    /* ---------- Core Brand Scale (derived from your 5 swatches) ---------- */
    brand: {
      900: '#0D1C33', // azure x -65% lightness
      800: '#143056',
      700: '#1F4C8B',
      600: '#427FD4', // azure
      500: '#3D81EF', // azure-2  (Primary base)
      400: '#7ABDF5', // maya-blue-2
      300: '#7EC1F6', // maya-blue
      200: '#AFCFFB',
      100: '#D9E8FF',
      50: '#F1F7FF',
    },

    /* ---------- Primary / Secondary ---------- */
    primary: '#3D81EF',
    primaryHover: '#346FCD', // ~8% darker
    primaryActive: '#2A5DB0', // ~16% darker
    primarySoftBg: '#E8F1FF', // very light brand 50-ish
    primarySoftText: '#1F4C8B',

    secondary: '#C4B8FC', // periwinkle
    secondaryHover: '#AE9AFA',
    secondaryActive: '#947DF7',
    secondarySoftBg: '#F3F0FE',
    secondarySoftText: '#5A4AA8',

    /* ---------- Neutral / Surfaces (kept—tweak if needed later) ---------- */
    neutral: {
      950: '#0A0F17',
      900: '#121926',
      800: '#1E2733',
      700: '#2A3442',
      600: '#364253',
      500: '#445166',
      400: '#5A6A81',
      300: '#7B889A',
      200: '#ADB7C4',
      150: '#C8D0DA',
      100: '#DCE2EA',
      50: '#F2F5F9',
      white: '#FFFFFF',
    },

    /* ---------- Status (kept for harmony; adjust later if desired) ---------- */
    success: {
      600: '#118264',
      500: '#15A17C',
      400: '#33B893',
      300: '#6FD7B9',
      200: '#A6E8D4',
      100: '#DBF8EE',
    },
    warning: {
      600: '#B35A05',
      500: '#D97706',
      400: '#F59E0B',
      300: '#FBC859',
      200: '#FDE3A3',
      100: '#FEF7E3',
    },
    danger: {
      600: '#A3203D',
      500: '#C62850',
      400: '#E23E66',
      300: '#F47B9F',
      200: '#F9B9CF',
      100: '#FDE4EE',
    },
    info: {
      600: '#1F4C8B',
      500: '#3D81EF',
      400: '#5C9AF2',
      300: '#8BC0FA',
      200: '#BFDDFE',
      100: '#E6F2FF',
    },

    focus: '#3D81EF',
    outline: '#AFCFFB',

    successBase: '#15A17C',
    warningBase: '#F59E0B',
    dangerBase: '#C62850',

    /* ---------- Gradients ---------- */
    gradient: {
      primary: 'linear-gradient(135deg, #427FD4 0%, #3D81EF 35%, #7EC1F6 70%, #C4B8FC 100%)',
      secondary: 'linear-gradient(135deg, #C4B8FC 0%, #7EC1F6 50%, #3D81EF 100%)',
      accent: 'linear-gradient(135deg, #3D81EF 0%, #7ABDF5 50%, #C4B8FC 100%)',
      info: 'linear-gradient(135deg, #143056 0%, #3D81EF 50%, #AFCFFB 100%)',
      success: 'linear-gradient(135deg, #118264 0%, #15A17C 45%, #6FD7B9 100%)',
      warning: 'linear-gradient(135deg, #B35A05 0%, #D97706 45%, #F59E0B 100%)',
      danger: 'linear-gradient(135deg, #A3203D 0%, #C62850 50%, #F47B9F 100%)',
      soft: 'linear-gradient(135deg, #F1F7FF 0%, #F3F0FE 50%, #F2F5F9 100%)',
      dark: 'linear-gradient(135deg, #0D1C33 0%, #143056 40%, #1F4C8B 100%)',
    },
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: '#F3F4F6',
    card: {
      default: '#FFFFFF',
      hover: '#FAFAFA',
    },
    text: {
      primary: '#101828',
      secondary: '#667085',
      tertiary: '#98A2B3',
      inverse: '#FFFFFF',
      accent: '#3D81EF',
    },
    status: {
      success: '#12B76A',
      successLight: '#ECFDF3',
      error: '#F04438',
      errorLight: '#FEF3F2',
      warning: '#F59E0B',
      warningLight: '#FFFAEB',
      info: '#06B6D4',
      infoLight: '#E0F7FA',
    },
    border: {
      light: '#F2F4F7',
      default: '#E4E7EC',
      focus: '#3D81EF',
    },
  },

  typography: {
    heading1: 'font-size: 32px; line-height: 40px; font-weight: 700; letter-spacing: -0.02em;',
    heading2: 'font-size: 24px; line-height: 32px; font-weight: 700; letter-spacing: -0.01em;',
    heading3: 'font-size: 20px; line-height: 28px; font-weight: 600;',
    body1: 'font-size: 16px; line-height: 24px; font-weight: 400;',
    body2: 'font-size: 14px; line-height: 20px; font-weight: 400;',
    caption: 'font-size: 12px; line-height: 18px; font-weight: 400;',
    button: 'font-size: 14px; line-height: 20px; font-weight: 600;',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  shadows: {
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 2px 4px rgba(16, 24, 40, 0.06)',
    md: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
    lg: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
    xl: '0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)',
    glow: '0 0 15px rgba(61, 129, 239, 0.3)',
  },

  radii: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    circle: '50%',
    pill: '9999px',
  },

  transitions: {
    swift: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  breakpoints: {
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
};











