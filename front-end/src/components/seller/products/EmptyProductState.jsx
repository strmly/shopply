import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
  min-height: 400px;
`;

const Illustration = styled.div`
  font-size: 80px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const Description = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  max-width: 400px;
`;

const AddButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.md};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EmptyProductState = ({ onAddProduct }) => {
  return (
    <Container>
      <Illustration>📦</Illustration>
      <Title>No products yet</Title>
      <Description>
        Get started by adding your first product. It only takes a few seconds!
      </Description>
      <AddButton onClick={onAddProduct}>Add Product</AddButton>
    </Container>
  );
};


