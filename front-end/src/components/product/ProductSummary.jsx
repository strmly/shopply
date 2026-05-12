import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 26px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.18), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease-in;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  ${props => props.theme.typography.caption}
  font-weight: 900;
  text-transform: uppercase;
`;

const DotMark = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 10px;
  font-size: clamp(28px, 5vw, 48px);
  line-height: 1.02;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subheadline = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
`;

const Highlights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${props => props.theme.spacing.md};
`;

const HighlightChip = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => {
    if (props.$variant === 'favorite') return props.theme.colors.primarySoftBg;
    if (props.$variant === 'trending') return props.theme.colors.warning[100];
    if (props.$variant === 'fast') return props.theme.colors.success[100];
    if (props.$variant === 'success') return props.theme.colors.success[100];
    if (props.$variant === 'new') return props.theme.colors.info[100];
    if (props.$variant === 'deal') return props.theme.colors.danger[100];
    if (props.$variant === 'warning') return props.theme.colors.warning[100];
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.$variant === 'favorite') return props.theme.colors.primary;
    if (props.$variant === 'trending') return props.theme.colors.warningBase;
    if (props.$variant === 'fast') return props.theme.colors.successBase;
    if (props.$variant === 'success') return props.theme.colors.successBase;
    if (props.$variant === 'new') return props.theme.colors.info[700];
    if (props.$variant === 'deal') return props.theme.colors.dangerBase;
    if (props.$variant === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.text.primary;
  }};
  padding: 7px 11px;
  border: 1px solid rgba(255,255,255,0.72);
  border-radius: 999px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`;

export const ProductSummary = ({ product, location }) => {
  const highlights = [];
  const suburb = location?.suburb || 'your area';

  if (product.isTrending) {
    highlights.push({ text: `Top seller in ${suburb}`, variant: 'trending' });
  }

  if (product.socialProof) {
    highlights.push({ text: product.socialProof, variant: 'trending' });
  }

  if (product.distance && product.distance < 2) {
    highlights.push({ text: 'Fast delivery today', variant: 'fast' });
  }

  if (product.stock === 'in' && product.stockQuantity > 10) {
    highlights.push({ text: 'Fresh stock', variant: 'success' });
  }

  if (product.stock === 'low') {
    highlights.push({ text: 'Low stock', variant: 'warning' });
  }

  if (product.isNew) {
    highlights.push({ text: 'New arrival', variant: 'new' });
  }

  if (product.discount && product.discount > 0) {
    highlights.push({ text: 'Best price nearby', variant: 'deal' });
  }

  if (product.distance && product.distance < 1) {
    highlights.push({ text: 'Neighborhood favorite', variant: 'favorite' });
  }

  return (
    <Container>
      <Eyebrow><DotMark />Curated in {suburb}</Eyebrow>
      <Title>{product.name}</Title>
      <Subheadline>
        {product.category} from {product.storeName}
        {product.description && ` - ${product.description.substring(0, 76)}...`}
      </Subheadline>

      {highlights.length > 0 && (
        <Highlights>
          {highlights.map((highlight, index) => (
            <HighlightChip key={index} $variant={highlight.variant}>
              {highlight.text}
            </HighlightChip>
          ))}
        </Highlights>
      )}
    </Container>
  );
};
