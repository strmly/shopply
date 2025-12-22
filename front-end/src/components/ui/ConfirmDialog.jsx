import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.2s ease;
`;

const Dialog = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 400px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows.xl};
  animation: ${slideUp} 0.3s ease;
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const Message = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  min-width: 100px;

  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;

    &:hover {
      background: ${props.theme.colors.primaryHover};
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.md};
    }
  ` : `
    background: ${props.theme.colors.surface};
    color: ${props.theme.colors.text.primary};
    border: 1px solid ${props.theme.colors.border.default};

    &:hover {
      background: ${props.theme.colors.surfaceAlt};
    }
  `}

  ${props => props.$danger && `
    background: ${props.theme.colors.danger[500]};
    color: white;

    &:hover {
      background: ${props.theme.colors.danger[600]};
    }
  `}
`;

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary', danger = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        {title && <Title>{title}</Title>}
        {message && <Message>{message}</Message>}
        <Actions>
          {onCancel && (
            <Button onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button $variant={variant} $danger={danger} onClick={onConfirm}>
            {confirmText}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};


