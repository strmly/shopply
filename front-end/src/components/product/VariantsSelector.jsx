import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 16px;
`;

const VariantsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const VariantChip = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$selected
    ? props.theme.colors.primary
    : props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.$selected
    ? props.theme.colors.primarySoftBg
    : props.disabled
      ? props.theme.colors.surface
      : props.theme.colors.background};
  color: ${props => props.$selected
    ? props.theme.colors.primary
    : props.disabled
      ? props.theme.colors.text.tertiary
      : props.theme.colors.text.primary};
  ${props => props.theme.typography.body2}
  font-weight: ${props => props.$selected ? 700 : 500};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const VariantsSelector = ({ variants, selectedVariant, onSelectVariant }) => {
  if (!variants || variants.length === 0) return null;

  // Group variants by name (e.g., Size, Color)
  const groupedVariants = variants.reduce((acc, variant) => {
    const name = variant.name || 'Default';
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(variant);
    return acc;
  }, {});

  return (
    <Container>
      {Object.entries(groupedVariants).map(([variantName, variantOptions]) => (
        <div key={variantName} style={{ marginBottom: '24px' }}>
          <SectionTitle>{variantName}</SectionTitle>
          <VariantsGrid>
            {variantOptions.map((variant, index) => (
              <VariantChip
                key={index}
                $selected={selectedVariant?.name === variant.name && selectedVariant?.value === variant.value}
                disabled={variant.stock === 'out'}
                onClick={() => variant.stock !== 'out' && onSelectVariant(variant)}
              >
                {variant.value || variant}
                {variant.stock === 'out' && ' (Out of stock)'}
              </VariantChip>
            ))}
          </VariantsGrid>
        </div>
      ))}
    </Container>
  );
};
