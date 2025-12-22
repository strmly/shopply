import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.3;
`;

const Subheadline = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 15px;
`;

const Highlights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const HighlightChip = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => {
    if (props.variant === 'favorite') return props.theme.colors.primarySoftBg;
    if (props.variant === 'trending') return props.theme.colors.warningSoftBg;
    if (props.variant === 'fast') return props.theme.colors.successSoftBg;
    if (props.variant === 'success') return props.theme.colors.successSoftBg;
    if (props.variant === 'new') return props.theme.colors.info[100];
    if (props.variant === 'deal') return props.theme.colors.dangerSoftBg;
    if (props.variant === 'warning') return props.theme.colors.warningSoftBg;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.variant === 'favorite') return props.theme.colors.primary;
    if (props.variant === 'trending') return props.theme.colors.warningBase;
    if (props.variant === 'fast') return props.theme.colors.successBase;
    if (props.variant === 'success') return props.theme.colors.successBase;
    if (props.variant === 'new') return props.theme.colors.info[700];
    if (props.variant === 'deal') return props.theme.colors.dangerBase;
    if (props.variant === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.text.primary;
  }};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.pill};
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

export const ProductSummary = ({ product, location }) => {
  const highlights = [];
  const suburb = location?.suburb || 'Your Area';
  
  if (product.isTrending) {
    highlights.push({ 
      text: `Top Seller in ${suburb}`, 
      variant: 'trending',
      icon: '🔥'
    });
  }
  
  if (product.socialProof) {
    highlights.push({ 
      text: product.socialProof, 
      variant: 'trending',
      icon: '⭐'
    });
  }
  
  if (product.distance && product.distance < 2) {
    highlights.push({ 
      text: 'Fast Delivery Today', 
      variant: 'fast',
      icon: '⚡'
    });
  }
  
  if (product.stock === 'in' && product.stockQuantity > 10) {
    highlights.push({ 
      text: 'Fresh Stock', 
      variant: 'success',
      icon: '✅'
    });
  }
  
  if (product.stock === 'low') {
    highlights.push({ 
      text: 'Low Stock', 
      variant: 'warning',
      icon: '⚠️'
    });
  }
  
  if (product.isNew) {
    highlights.push({ 
      text: 'New Arrival', 
      variant: 'new',
      icon: '🆕'
    });
  }
  
  if (product.discount && product.discount > 0) {
    highlights.push({ 
      text: 'Best Price Nearby', 
      variant: 'deal',
      icon: '💰'
    });
  }
  
  if (product.distance && product.distance < 1) {
    highlights.push({ 
      text: 'Neighborhood Favorite', 
      variant: 'favorite',
      icon: '❤️'
    });
  }

  return (
    <Container>
      <Title>{product.name}</Title>
      <Subheadline>
        {product.category} • {product.storeName}
        {product.description && ` • ${product.description.substring(0, 50)}...`}
      </Subheadline>
      
      {highlights.length > 0 && (
        <Highlights>
          {highlights.map((highlight, index) => (
            <HighlightChip key={index} variant={highlight.variant}>
              {highlight.icon && <span>{highlight.icon}</span>}
              {highlight.text}
            </HighlightChip>
          ))}
        </Highlights>
      )}
    </Container>
  );
};

