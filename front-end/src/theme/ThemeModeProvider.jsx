import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme as baseTheme } from '../theme';

import API_BASE_URL from '@config/api';
const DEFAULT_USER_ID = 'default';

export const ThemeModeContext = createContext({
  mode: 'system',
  setMode: () => {},
});

const buildThemeForMode = (mode) => {
  const isDark = mode === 'dark';

  if (!isDark) {
    return baseTheme;
  }

  // Dark theme: override key tokens while keeping the same structure
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: '#101623',
      surface: '#0F172A',
      surfaceAlt: '#020617',
      card: {
        ...baseTheme.colors.card,
        default: '#020617',
        hover: '#020617',
      },
      text: {
        ...baseTheme.colors.text,
        primary: '#F9FAFB',
        secondary: '#CBD5F5',
        tertiary: '#64748B',
        inverse: '#020617',
      },
      border: {
        ...baseTheme.colors.border,
        light: '#1F2937',
        default: '#1F2937',
        focus: baseTheme.colors.border.focus,
      },
      neutral: {
        ...baseTheme.colors.neutral,
        950: '#020617',
        900: '#020617',
        800: '#0B1220',
        700: '#020617',
        600: '#1F2937',
        500: '#374151',
        400: '#4B5563',
        300: '#6B7280',
        200: '#9CA3AF',
        150: '#D1D5DB',
        100: '#E5E7EB',
        50: '#F9FAFB',
        white: '#020617',
      },
      gradient: {
        ...baseTheme.colors.gradient,
        primary:
          'linear-gradient(135deg, #0B1220 0%, #1F2937 35%, #1F4C8B 70%, #7EC1F6 100%)',
        dark: baseTheme.colors.gradient.dark,
      },
    },
  };
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Resolve system preference
  const resolvedMode = useMemo(() => {
    if (mode !== 'system') return mode;
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [mode]);

  // Load initial mode from backend (with localStorage fallback)
  useEffect(() => {
    let isMounted = true;

    const fromStorage = typeof window !== 'undefined'
      ? window.localStorage.getItem('shopply_theme_mode')
      : null;
    if (fromStorage === 'light' || fromStorage === 'dark' || fromStorage === 'system') {
      setMode(fromStorage);
      setIsLoaded(true);
    }

    const loadFromApi = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/profile/${DEFAULT_USER_ID}/preferences`
        );
        if (!response.ok) return;
        const json = await response.json();
        if (!json.success || !json.data) return;

        const apiMode = json.data.theme;
        if (
          isMounted &&
          (apiMode === 'light' || apiMode === 'dark' || apiMode === 'system')
        ) {
          setMode(apiMode);
          window.localStorage.setItem('shopply_theme_mode', apiMode);
        }
      } catch {
        // Fail silently – fall back to storage / system
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    // If we already had a stored preference, API is best-effort only
    loadFromApi();

    // Listen for OS theme changes when in system mode
    if (window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (mode === 'system') {
          // Force re-compute by toggling state
          setMode((prev) => prev);
        }
      };
      media.addEventListener('change', handler);
      return () => {
        isMounted = false;
        media.removeEventListener('change', handler);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const themedValue = useMemo(
    () => ({
      mode,
      setMode: (nextMode) => {
        setMode(nextMode);
        window.localStorage.setItem('shopply_theme_mode', nextMode);

        // Persist to backend (fire-and-forget)
        try {
          fetch(`${API_BASE_URL}/profile/${DEFAULT_USER_ID}/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ theme: nextMode }),
          }).catch(() => {});
        } catch {
          // Ignore network errors here
        }
      },
    }),
    [mode]
  );

  const themedObject = useMemo(
    () => buildThemeForMode(resolvedMode),
    [resolvedMode]
  );

  return (
    <ThemeModeContext.Provider value={themedValue}>
      <ThemeProvider theme={themedObject}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
};


