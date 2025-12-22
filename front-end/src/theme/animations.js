import { keyframes } from 'styled-components';

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Animation keyframes
export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const pulse = keyframes`
  0% { 
    box-shadow: 0 0 0 0 ${hexToRgba('#12B76A', 0.4)}; 
  }
  70% { 
    box-shadow: 0 0 0 10px ${hexToRgba('#12B76A', 0)}; 
  }
  100% { 
    box-shadow: 0 0 0 0 ${hexToRgba('#12B76A', 0)}; 
  }
`;

