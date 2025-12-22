import React from 'react';
import styled from 'styled-components';
import { CollapsibleSection } from './CollapsibleSection';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ToggleSwitch = styled.div`
  width: 48px;
  height: 24px;
  background: ${props => (props.$checked ? props.theme.colors.primary : props.theme.colors.surfaceAlt)};
  border-radius: 12px;
  position: relative;
  transition: ${props => props.theme.transitions.swift};

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => (props.$checked ? '26px' : '2px')};
    transition: ${props => props.theme.transitions.swift};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const Hint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
`;

export const InventorySection = ({ product, onChange }) => {
  return (
    <CollapsibleSection title="Inventory">
      <Toggle>
        <ToggleSwitch
          $checked={product.trackInventory !== false}
          onClick={() => onChange('trackInventory', !product.trackInventory)}
        />
        <Label>Track Inventory</Label>
      </Toggle>
      <Hint>Disable for service-type items or unlimited stock</Hint>

      {product.trackInventory !== false && (
        <>
          <FormGroup>
            <Label>Stock Quantity</Label>
            <Input
              type="number"
              min="0"
              value={product.stockQuantity || 0}
              onChange={(e) => onChange('stockQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Low Stock Threshold</Label>
            <Input
              type="number"
              min="0"
              value={product.lowStockThreshold || 5}
              onChange={(e) => onChange('lowStockThreshold', parseInt(e.target.value) || 5)}
              placeholder="5"
            />
            <Hint>You'll be alerted when stock falls below this number</Hint>
          </FormGroup>
        </>
      )}
    </CollapsibleSection>
  );
};


