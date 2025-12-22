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

const Required = styled.span`
  color: ${props => props.theme.colors.danger[500]};
  margin-left: 4px;
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

const PricePreview = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  margin-top: ${props => props.theme.spacing.sm};
`;

const PriceDisplay = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
`;

const DiscountBadge = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.success[600]};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: 600;
`;

const Hint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ErrorMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.danger[500]};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: 500;
`;

export const PricingSection = ({ product, onChange }) => {
  const price = parseFloat(product.price) || 0;
  const discountPrice = product.discountPrice !== null && product.discountPrice !== undefined
    ? parseFloat(product.discountPrice)
    : null;

  const discountPercent = discountPrice && price > 0
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const displayPrice = discountPrice !== null ? discountPrice : price;

  return (
    <CollapsibleSection title="Pricing" defaultOpen={true}>
      <FormGroup>
        <Label>
          Base Price (R) <Required>*</Required>
        </Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={product.price || ''}
          onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Sale Price (R) - Optional</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : ''}
          onChange={(e) => {
            const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0;
            onChange('discountPrice', value);
          }}
          placeholder="Leave empty for no discount"
        />
        {discountPrice !== null && discountPrice >= price && price > 0 ? (
          <ErrorMessage>Sale price must be less than base price</ErrorMessage>
        ) : (
          <Hint>Leave empty for no discount</Hint>
        )}
      </FormGroup>

      {(price > 0 || discountPrice !== null) && (
        <PricePreview>
          <PriceDisplay>R{displayPrice.toFixed(2)}</PriceDisplay>
          {discountPrice !== null && discountPercent > 0 && (
            <DiscountBadge>
              You're giving {discountPercent}% off
            </DiscountBadge>
          )}
          {discountPrice !== null && (
            <div style={{ marginTop: '4px', fontSize: '12px', textDecoration: 'line-through', opacity: 0.6 }}>
              R{price.toFixed(2)}
            </div>
          )}
        </PricePreview>
      )}
    </CollapsibleSection>
  );
};

