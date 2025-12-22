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

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const DiscountInput = styled(Input)`
  width: 80px;
  border-color: ${props => props.theme.colors.warning[500]};
`;

const Button = styled.button`
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

export const InlineEditPrice = ({ price, discountPrice, onSave, onCancel }) => {
  const [basePrice, setBasePrice] = useState(price || 0);
  const [salePrice, setSalePrice] = useState(discountPrice !== null && discountPrice !== undefined ? discountPrice : '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    const base = parseFloat(basePrice);
    const sale = salePrice === '' ? null : parseFloat(salePrice);

    if (isNaN(base) || base <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    if (sale !== null && (isNaN(sale) || sale <= 0)) {
      alert('Sale price must be greater than 0');
      return;
    }

    if (sale !== null && sale >= base) {
      alert('Sale price must be less than base price');
      return;
    }

    onSave(base, sale);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Container>
      <span>R</span>
      <Input
        ref={inputRef}
        type="number"
        step="0.01"
        min="0"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="0.00"
      />
      {salePrice !== '' && (
        <>
          <span>Sale:</span>
          <DiscountInput
            type="number"
            step="0.01"
            min="0"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="0.00"
          />
        </>
      )}
      <Button $primary onClick={handleSave}>
        ✓
      </Button>
      <Button onClick={onCancel}>✕</Button>
    </Container>
  );
};


