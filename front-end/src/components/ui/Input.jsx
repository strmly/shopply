import styled from 'styled-components';

// Input component exports
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  position: relative;
`;

export const InputLabel = styled.label`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

// Export Label as alias for InputLabel
export const Label = InputLabel;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Export Input directly as the styled component
export const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-right: ${props => (props.$hasIcon ? '40px' : props.theme.spacing.md)};
  border: 2px solid ${props => {
    if (props.$error) return props.theme.colors.dangerBase;
    if (props.$success) return props.theme.colors.successBase;
    return props.theme.colors.border.light;
  }};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$error) return props.theme.colors.dangerBase;
      if (props.$success) return props.theme.colors.successBase;
      return props.theme.colors.primary;
    }};
    box-shadow: 0 0 0 3px ${props => {
      if (props.$error) return props.theme.colors.dangerSoftBg;
      if (props.$success) return props.theme.colors.successSoftBg;
      return props.theme.colors.primarySoftBg;
    }};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }

  &:disabled {
    background: ${props => props.theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Also export as StyledInput for backward compatibility
export const StyledInput = Input;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => {
    if (props.$error) return props.theme.colors.dangerBase;
    if (props.$success) return props.theme.colors.successBase;
    return props.theme.colors.border.light;
  }};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  min-height: 80px;
  resize: vertical;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.theme.colors.background};
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$error) return props.theme.colors.dangerBase;
      if (props.$success) return props.theme.colors.successBase;
      return props.theme.colors.primary;
    }};
    box-shadow: 0 0 0 3px ${props => {
      if (props.$error) return props.theme.colors.dangerSoftBg;
      if (props.$success) return props.theme.colors.successSoftBg;
      return props.theme.colors.primarySoftBg;
    }};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-right: ${props => (props.$hasIcon ? '40px' : props.theme.spacing.md)};
  border: 2px solid ${props => {
    if (props.$error) return props.theme.colors.dangerBase;
    if (props.$success) return props.theme.colors.successBase;
    return props.theme.colors.border.light;
  }};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  background: ${props => props.theme.colors.background};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667085' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${props => props.theme.spacing.md} center;
  padding-right: ${props => props.theme.spacing.xl};

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$error) return props.theme.colors.dangerBase;
      if (props.$success) return props.theme.colors.successBase;
      return props.theme.colors.primary;
    }};
    box-shadow: 0 0 0 3px ${props => {
      if (props.$error) return props.theme.colors.dangerSoftBg;
      if (props.$success) return props.theme.colors.successSoftBg;
      return props.theme.colors.primarySoftBg;
    }};
  }

  &:disabled {
    background: ${props => props.theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  pointer-events: none;
  font-size: 20px;
`;

export const ErrorMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: -${props => props.theme.spacing.xs};
`;

export const HelperText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-top: -${props => props.theme.spacing.xs};
`;

export const SuccessMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: -${props => props.theme.spacing.xs};
`;

// Default export for backward compatibility
export default Input;

