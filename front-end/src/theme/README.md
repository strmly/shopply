# Theme System

This directory contains the theme configuration for the Tsenga application. The theme is available to all components via styled-components' `ThemeProvider`.

## Usage

### In Styled Components

```jsx
import styled from 'styled-components';

const MyComponent = styled.div`
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.md};
`;
```

### Using the useTheme Hook

```jsx
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <div style={{ 
      color: theme.colors.primary,
      padding: theme.spacing.md 
    }}>
      Hello World
    </div>
  );
};
```

### Direct Import

```jsx
import { theme } from '../theme';

const color = theme.colors.primary;
const spacing = theme.spacing.md;
```

## Theme Structure

- **colors**: Brand colors, neutrals, status colors, gradients, and semantic colors
- **typography**: Pre-defined typography styles for headings, body text, captions, and buttons
- **spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **shadows**: Elevation system (xs, sm, md, lg, xl, glow)
- **radii**: Border radius values (xs, sm, md, lg, xl, circle, pill)
- **transitions**: Animation timing functions (swift, bounce, spring)
- **breakpoints**: Responsive breakpoints (tablet, desktop, wide)

## Animations

Animations are available in `theme/animations.js`:
- `fadeIn`: Fade in with slide up animation
- `pulse`: Pulsing box-shadow animation

```jsx
import styled from 'styled-components';
import { fadeIn } from '../theme/animations';

const AnimatedDiv = styled.div`
  animation: ${fadeIn} 0.5s ease-in;
`;
```











