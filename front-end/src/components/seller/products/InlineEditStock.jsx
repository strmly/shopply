import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.body2}
  width: 80px;
  font-weight: 600;
  text-align: center;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const Button = styled.button`
  width: 32px;
  height: 32px;
  padding: 0;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.sm};
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => (props.$primary ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$primary ? 'white' : props.theme.colors.text.secondary)};
  border: ${props => (props.$primary ? 'none' : `1px solid ${props.theme.colors.border.default}`)};
  border-radius: ${props => props.theme.radii.sm};
  cursor: pointer;
  ${props => props.theme.typography.caption}
  font-weight: 600;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => (props.$primary ? props.theme.colors.primaryHover : props.theme.colors.surface)};
  }
`;

export const InlineEditStock = ({ stockQuantity, trackInventory, onSave, onCancel }) => {
  const [quantity, setQuantity] = useState(stockQuantity || 0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleIncrement = () => {
    setQuantity(prev => Math.max(0, prev + 1));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const handleSave = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      alert('Stock quantity must be a non-negative number');
      return;
    }

    onSave(qty);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!trackInventory) {
    return (
      <Container>
        <span>Unlimited</span>
        <ActionButton onClick={onCancel}>✕</ActionButton>
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={handleDecrement}>−</Button>
      <Input
        ref={inputRef}
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <Button onClick={handleIncrement}>+</Button>
      <ActionButton $primary onClick={handleSave}>
        ✓
      </ActionButton>
      <ActionButton onClick={onCancel}>✕</ActionButton>
    </Container>
  );
};


