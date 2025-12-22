import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

/**
 * Custom hook to access the theme object in any component
 * @returns {Object} The theme object
 * 
 * @example
 * const MyComponent = () => {
 *   const theme = useTheme();
 *   return <div style={{ color: theme.colors.primary }}>Hello</div>;
 * };
 */
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};











