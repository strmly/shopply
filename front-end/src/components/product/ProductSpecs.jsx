import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 26px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.18), rgba(196, 184, 252, 0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  box-shadow: 0 14px 32px rgba(16, 24, 40, 0.06);
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 900;
  font-size: 18px;
`;

const SpecsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const SpecRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  background: ${props => props.theme.colors.neutral[50]};
`;

const SpecLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 700;
`;

const SpecValue = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 800;
  font-size: 14px;
  text-align: right;
`;

export const ProductSpecs = ({ product }) => {
  const specs = [];

  // Furniture-specific specs
  if (product.room) {
    specs.push({ label: 'Room', value: product.room });
  }

  if (product.category) {
    specs.push({ label: 'Category', value: product.category });
  }

  if (product.sub_category) {
    specs.push({ label: 'Type', value: product.sub_category });
  }

  if (product.condition) {
    specs.push({ label: 'Condition', value: product.condition });
  }

  if (product.style) {
    specs.push({ label: 'Style', value: product.style });
  }

  // Dimensions (furniture-specific)
  if (product.dimensions_cm && product.dimensions_cm.width) {
    const dims = product.dimensions_cm;
    specs.push({ 
      label: 'Dimensions', 
      value: `W:${dims.width} x D:${dims.depth} x H:${dims.height}cm` 
    });
  }

  // Materials (furniture-specific)
  if (product.material_primary) {
    let materialValue = product.material_primary;
    if (product.material_secondary) {
      materialValue += `, ${product.material_secondary}`;
    }
    specs.push({ label: 'Material', value: materialValue });
  }

  if (product.color_primary) {
    specs.push({ label: 'Color', value: product.color_primary });
  }

  if (product.weight_kg) {
    specs.push({ label: 'Weight', value: `${product.weight_kg}kg` });
  }

  // Assembly & Delivery (furniture-specific)
  if (product.assembly_required !== undefined) {
    specs.push({ 
      label: 'Assembly', 
      value: product.assembly_required ? 'Required' : 'Not Required' 
    });
  }

  if (product.delivery_eligible !== undefined) {
    specs.push({ 
      label: 'Delivery', 
      value: product.delivery_eligible ? 'Available' : 'Pickup Only' 
    });
  }

  if (product.lead_time_days_min !== undefined && product.lead_time_days_max !== undefined) {
    specs.push({ 
      label: 'Lead Time', 
      value: `${product.lead_time_days_min}-${product.lead_time_days_max} days` 
    });
  }

  // Stock information
  if (product.stock_type) {
    let stockLabel = product.stock_type.replace(/_/g, ' ');
    stockLabel = stockLabel.charAt(0).toUpperCase() + stockLabel.slice(1);
    specs.push({ label: 'Stock Type', value: stockLabel });
  }

  if (product.stock_on_hand) {
    specs.push({ label: 'Available', value: `${product.stock_on_hand} units` });
  } else if (product.stockQuantity) {
    specs.push({ label: 'Available', value: `${product.stockQuantity} units` });
  }

  // Store info
  if (product.storeName) {
    specs.push({ label: 'Store', value: product.storeName });
  }

  if (product.distance) {
    specs.push({ label: 'Distance', value: `${product.distance}km away` });
  }

  if (product.rating) {
    specs.push({ label: 'Rating', value: `${product.rating.toFixed(1)} rated` });
  }

  // Care notes (furniture-specific)
  if (product.care_notes) {
    specs.push({ label: 'Care', value: product.care_notes });
  }

  if (specs.length === 0) return null;

  return (
    <Container>
      <SectionTitle>Product Information</SectionTitle>
      <SpecsList>
        {specs.map((spec, index) => (
          <SpecRow key={index}>
            <SpecLabel>{spec.label}</SpecLabel>
            <SpecValue>{spec.value}</SpecValue>
          </SpecRow>
        ))}
      </SpecsList>
    </Container>
  );
};











