import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.md} 0;
  animation: ${fadeIn} 0.3s ease-in;
`;

const StoreCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 2px solid ${props => props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.swift};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StoreLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-weight: 700;
  font-size: 18px;
`;

const StoreRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const StoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const DetailLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ViewStoreButton = styled.button`
  width: 100%;
  margin-top: 0;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const WhatsAppButton = styled.a`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: #128c7e;
  color: #ffffff;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 800;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 14px 28px rgba(18, 140, 126, 0.22);

  &:hover {
    background: #075e54;
    transform: translateY(-1px);
    box-shadow: 0 18px 34px rgba(18, 140, 126, 0.28);
  }

  &[aria-disabled='true'] {
    pointer-events: none;
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.text.secondary};
    box-shadow: none;
  }
`;

const VerifiedBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.successSoftBg};
  color: ${props => props.theme.colors.successBase};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
  margin-left: ${props => props.theme.spacing.xs};
`;

const normalizeWhatsAppNumber = (value = '') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  if (digits.length === 9) digits = `27${digits}`;

  return digits;
};

const buildWhatsAppLink = (product, location) => {
  const contact = product.sellerContact || {};
  const rawNumber = contact.whatsappNumber
    || contact.storePhone
    || product.whatsappNumber
    || product.storePhone
    || product.sellerPhone
    || '';
  const number = normalizeWhatsAppNumber(rawNumber);

  if (!number) return '';

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const area = location?.suburb ? ` in ${location.suburb}` : '';
  const message = [
    `Hi ${product.storeName || 'there'},`,
    `I found ${product.name} on Shopply${area}.`,
    `Is it still available?`,
    productUrl,
  ].filter(Boolean).join('\n');

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const SellerModule = ({ product, location }) => {
  const navigate = useNavigate();
  const distance = product.distance || product.storeLocation?.distance || 'N/A';
  const distNum = parseFloat(distance);
  const deliveryFee = !isNaN(distNum) && distNum < 2 ? 'Free' : 'R15';
  const rating = product.rating || 4.5;
  const whatsappHref = buildWhatsAppLink(product, location);

  return (
    <Container>
      <StoreCard>
        <StoreHeader>
          <StoreLogo>🏪</StoreLogo>
          <StoreInfo>
            <StoreName>
              {product.storeName}
              <VerifiedBadge>✓ Verified</VerifiedBadge>
            </StoreName>
            <StoreRating>
              ⭐ {rating.toFixed(1)} ({product.reviewCount || 0} reviews)
            </StoreRating>
          </StoreInfo>
        </StoreHeader>
        
        <StoreDetails>
          <DetailRow>
            <DetailLabel>Distance</DetailLabel>
            <DetailValue>{distance}km away</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Delivery Fee</DetailLabel>
            <DetailValue>{deliveryFee}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Pickup Available</DetailLabel>
            <DetailValue>Yes • Same day</DetailValue>
          </DetailRow>
        </StoreDetails>
        
        <ActionGrid>
          <WhatsAppButton
            href={whatsappHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappHref}
            title={whatsappHref ? 'Chat with this seller on WhatsApp' : 'Seller WhatsApp number is not available'}
          >
            WhatsApp seller
          </WhatsAppButton>
          <ViewStoreButton type="button" onClick={() => navigate(`/store/${product.storeId || 1}`)}>
            View Store
          </ViewStoreButton>
        </ActionGrid>
      </StoreCard>
    </Container>
  );
};











