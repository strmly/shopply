import React, { useState } from 'react';
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

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  background: white;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const Tag = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: 500;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  line-height: 1;
`;

const TagInput = styled.input`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  flex: 1;
  min-width: 120px;

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

const SUGGESTED_TAGS = ['fresh', 'organic', 'local', 'premium', 'sale', 'new', 'popular'];

const CATEGORIES = [
  'Groceries',
  'Braai',
  'Electronics',
  'Home & Kitchen',
  'Fashion',
  'Baby & Kids',
  'Health',
  'Beauty',
  'Sports',
  'Other',
];

export const CategoriesSection = ({ product, onChange }) => {
  const [tagInput, setTagInput] = useState('');
  const tags = product.tags || [];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange('tags', [...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestedTag = (tag) => {
    if (!tags.includes(tag)) {
      onChange('tags', [...tags, tag]);
    }
  };

  return (
    <CollapsibleSection title="Categories & Tags">
      <FormGroup>
        <Label>
          Category <Required>*</Required>
        </Label>
        <Select
          value={product.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Tags</Label>
        <TagInput
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleAddTag}
          placeholder="Type and press Enter to add tag"
        />
        <Hint>Tags help customers find your products</Hint>

        {tags.length > 0 && (
          <TagsContainer>
            {tags.map(tag => (
              <Tag key={tag}>
                {tag}
                <RemoveTagButton onClick={() => handleRemoveTag(tag)}>
                  ×
                </RemoveTagButton>
              </Tag>
            ))}
          </TagsContainer>
        )}

        {SUGGESTED_TAGS.length > 0 && (
          <>
            <Hint style={{ marginTop: '8px' }}>Suggested tags:</Hint>
            <TagsContainer>
              {SUGGESTED_TAGS.map(tag => (
                <Tag
                  key={tag}
                  onClick={() => handleSuggestedTag(tag)}
                  style={{ cursor: 'pointer', opacity: tags.includes(tag) ? 0.5 : 1 }}
                >
                  + {tag}
                </Tag>
              ))}
            </TagsContainer>
          </>
        )}
      </FormGroup>
    </CollapsibleSection>
  );
};


