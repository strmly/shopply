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

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
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

const CharacterCount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$count > props.$max) return props.theme.colors.danger[500];
    if (props.$count > props.$max * 0.9) return props.theme.colors.warning[500];
    return props.theme.colors.text.tertiary;
  }};
  margin-top: ${props => props.theme.spacing.xs};
  text-align: right;
`;

export const ProductInfoSection = ({ product, onChange }) => {
  const nameLength = product.name?.length || 0;
  const descriptionLength = product.description?.length || 0;
  const maxNameLength = 100;
  const maxDescriptionLength = 2000;

  return (
    <CollapsibleSection title="Product Info" defaultOpen={true}>
      <FormGroup>
        <Label>
          Product Name <Required>*</Required>
        </Label>
        <Input
          type="text"
          value={product.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Fresh Tomatoes (1kg)"
          required
          maxLength={maxNameLength}
          style={{
            borderColor: !product.name || product.name.trim() === '' 
              ? undefined 
              : nameLength > maxNameLength 
                ? '#C62850' 
                : undefined
          }}
        />
        <CharacterCount $count={nameLength} $max={maxNameLength}>
          {nameLength}/{maxNameLength}
        </CharacterCount>
        {!product.name || product.name.trim() === '' ? (
          <ErrorMessage>Product name is required</ErrorMessage>
        ) : (
          <Hint>Choose a clear, descriptive name that customers will search for</Hint>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Subtitle (Optional)</Label>
        <Input
          type="text"
          value={product.subtitle || ''}
          onChange={(e) => onChange('subtitle', e.target.value)}
          placeholder="e.g., Farm-fresh, locally sourced"
        />
        <Hint>Add a short subtitle to highlight key features</Hint>
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <TextArea
          value={product.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe your product in detail. Include size, weight, ingredients, or any important information customers should know."
          maxLength={maxDescriptionLength}
          style={{
            borderColor: descriptionLength > maxDescriptionLength ? '#C62850' : undefined
          }}
        />
        <CharacterCount $count={descriptionLength} $max={maxDescriptionLength}>
          {descriptionLength}/{maxDescriptionLength}
        </CharacterCount>
        <Hint>Products with detailed descriptions sell better</Hint>
      </FormGroup>
    </CollapsibleSection>
  );
};

