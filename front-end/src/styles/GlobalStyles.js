import { createGlobalStyle } from 'styled-components';
import { theme } from '../theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    width: 100%;
  }

  :root {
    /* Color Variables */
    --color-primary: ${theme.colors.primary};
    --color-primary-hover: ${theme.colors.primaryHover};
    --color-primary-active: ${theme.colors.primaryActive};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    
    /* Spacing Variables */
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    /* Border Radius Variables */
    --radius-xs: ${theme.radii.xs};
    --radius-sm: ${theme.radii.sm};
    --radius-md: ${theme.radii.md};
    --radius-lg: ${theme.radii.lg};
    --radius-xl: ${theme.radii.xl};
  }

  body {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    ${theme.typography.body1}
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 {
    ${theme.typography.heading1}
    color: ${theme.colors.text.primary};
  }

  h2 {
    ${theme.typography.heading2}
    color: ${theme.colors.text.primary};
  }

  h3 {
    ${theme.typography.heading3}
    color: ${theme.colors.text.primary};
  }

  p {
    ${theme.typography.body1}
    color: ${theme.colors.text.primary};
  }

  button {
    ${theme.typography.button}
    transition: ${theme.transitions.swift};
  }

  code {
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9em;
    background-color: ${theme.colors.surfaceAlt};
    padding: 2px 6px;
    border-radius: ${theme.radii.xs};
  }
`;

