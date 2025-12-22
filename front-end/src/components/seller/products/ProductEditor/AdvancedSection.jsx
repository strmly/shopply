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

const DimensionsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.sm};
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

const BarcodeButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  ${props => props.theme.typography.body2}
  margin-left: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.surfaceAlt};
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const AdvancedSection = ({ product, onChange, onNestedChange }) => {
  const dimensions = product.dimensions || { length: '', width: '', height: '' };

  const handleDimensionChange = (field, value) => {
    onNestedChange('dimensions', field, value);
  };

  const handleBarcodeScan = () => {
    // In production, this would open camera for barcode scanning
    // For now, show a prompt
    const barcode = prompt('Enter barcode or scan with camera:');
    if (barcode) {
      onChange('barcode', barcode);
    }
  };

  return (
    <CollapsibleSection title="Advanced Options">
      <FormGroup>
        <Label>SKU (Stock Keeping Unit)</Label>
        <Input
          type="text"
          value={product.sku || ''}
          onChange={(e) => onChange('sku', e.target.value)}
          placeholder="Auto-generated if left empty"
        />
        <Hint>Leave empty to auto-generate</Hint>
      </FormGroup>

      <FormGroup>
        <Label>Barcode</Label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            type="text"
            value={product.barcode || ''}
            onChange={(e) => onChange('barcode', e.target.value)}
            placeholder="Enter barcode or scan"
            style={{ flex: 1 }}
          />
          <BarcodeButton onClick={handleBarcodeScan}>
            📷 Scan
          </BarcodeButton>
        </div>
        <Hint>Scan barcode using your device camera</Hint>
      </FormGroup>

      <FormGroup>
        <Label>Weight (kg)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={product.weight || ''}
          onChange={(e) => onChange('weight', e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="0.00"
        />
      </FormGroup>

      <FormGroup>
        <Label>Dimensions (cm)</Label>
        <DimensionsRow>
          <div>
            <Label style={{ fontSize: '12px' }}>Length</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={dimensions.length || ''}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label style={{ fontSize: '12px' }}>Width</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={dimensions.width || ''}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label style={{ fontSize: '12px' }}>Height</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={dimensions.height || ''}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              placeholder="0"
            />
          </div>
        </DimensionsRow>
      </FormGroup>

      <FormGroup>
        <Label>Preparation Time (minutes)</Label>
        <Input
          type="number"
          min="0"
          value={product.preparationTime || ''}
          onChange={(e) => onChange('preparationTime', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="For food sellers"
        />
        <Hint>Time needed to prepare this item (for food sellers)</Hint>
      </FormGroup>

      <FormGroup>
        <Label>Expiry Date</Label>
        <Input
          type="date"
          value={product.expiryDate || ''}
          onChange={(e) => onChange('expiryDate', e.target.value || null)}
        />
        <Hint>For perishable items</Hint>
      </FormGroup>

      <FormGroup>
        <Label>Batch Number</Label>
        <Input
          type="text"
          value={product.batchNumber || ''}
          onChange={(e) => onChange('batchNumber', e.target.value || null)}
          placeholder="Optional"
        />
      </FormGroup>

      <Toggle>
        <ToggleSwitch
          $checked={product.isVisible !== false}
          onClick={() => onChange('isVisible', !product.isVisible)}
        />
        <Label>Make product visible to customers</Label>
      </Toggle>
      <Hint>Hidden products won't appear in search or listings</Hint>
    </CollapsibleSection>
  );
};


