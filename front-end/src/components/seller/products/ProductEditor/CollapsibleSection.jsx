import React, { useState } from 'react';
import styled from 'styled-components';

const Section = styled.div`
  background: ${props => props.theme.colors.card.default};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  transition: ${props => props.theme.transitions.swift};
  margin-bottom: ${props => props.theme.spacing.md};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  background: ${props => props.theme.colors.surface};
  border-bottom: ${props => (props.$isOpen ? `1px solid ${props.theme.colors.border.light}` : 'none')};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 18px;
`;

const ToggleIcon = styled.span`
  font-size: 20px;
  color: ${props => props.theme.colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  animation: ${props => (props.$isOpen ? 'fadeIn 0.2s ease' : 'none')};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Section>
      <Header $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <Title>{title}</Title>
        <ToggleIcon $isOpen={isOpen}>▼</ToggleIcon>
      </Header>
      <Content $isOpen={isOpen}>{children}</Content>
    </Section>
  );
};


