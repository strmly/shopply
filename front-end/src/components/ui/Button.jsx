import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const StyledButton = styled.button`
  ${props => props.theme.typography.button}
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: 600;
  min-height: 44px;
  animation: ${fadeIn} 0.3s ease-in;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: ${props.theme.colors.primary};
        color: ${props.theme.colors.text.inverse};
        box-shadow: ${props.theme.shadows.sm};
        
        &:hover:not(:disabled) {
          background: ${props.theme.colors.primaryHover};
          box-shadow: ${props.theme.shadows.md};
          transform: translateY(-2px);
        }
        
        &:active:not(:disabled) {
          background: ${props.theme.colors.primaryActive};
          transform: translateY(0);
        }
      `;
    }
    
    if (props.$variant === 'secondary' || props.$variant === 'outline') {
      return `
        background: transparent;
        color: ${props.theme.colors.primary};
        border: 2px solid ${props.theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${props.theme.colors.primarySoftBg};
          border-color: ${props.theme.colors.primaryHover};
        }
        
        &:active:not(:disabled) {
          background: ${props.theme.colors.primarySoftBg};
          border-color: ${props.theme.colors.primaryActive};
        }
      `;
    }
    
    if (props.$variant === 'ghost') {
      return `
        background: transparent;
        color: ${props.theme.colors.text.secondary};
        
        &:hover:not(:disabled) {
          background: ${props.theme.colors.surface};
          color: ${props.theme.colors.text.primary};
        }
      `;
    }
    
    return '';
  }}

  ${props => props.$fullWidth && `
    width: 100%;
  `}
`;

export const Button = ({ variant = 'primary', $fullWidth, ...rest }) => (
  <StyledButton $variant={variant} $fullWidth={$fullWidth} {...rest} />
);

