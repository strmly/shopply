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
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
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
  align-items: flex-end;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const Sheet = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.xl} ${props => props.theme.radii.xl} 0 0;
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
  animation: ${slideUp} 0.3s ease;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.tertiary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  border-radius: ${props => props.theme.radii.sm};

  &:hover {
    background: ${props => props.theme.colors.neutral[50]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Sheet>
        <Header>
          {title && <Title>{title}</Title>}
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <Content>
          {children}
        </Content>
      </Sheet>
    </Overlay>
  );
};

