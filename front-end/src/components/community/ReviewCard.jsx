import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const UserName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 14px;
`;

const Badge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => {
    if (props.type === 'verified') return props.theme.colors.successSoftBg;
    if (props.type === 'distance') return props.theme.colors.primarySoftBg;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.type === 'verified') return props.theme.colors.successBase;
    if (props.type === 'distance') return props.theme.colors.primary;
    return props.theme.colors.text.secondary;
  }};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 9px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  flex-wrap: wrap;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Content = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 14px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
`;

const Photo = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  background: ${props => props.theme.colors.surface};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 12px;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const MerchantResponse = styled.div`
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const MerchantResponseHeader = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
  font-size: 11px;
  margin-bottom: 4px;
`;

const MerchantResponseText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
`;

export const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <Header>
        <Avatar>{review.userAvatar || '👤'}</Avatar>
        <UserInfo>
          <UserNameRow>
            <UserName>{review.userName}</UserName>
            {review.verifiedPurchase && (
              <Badge type="verified">✓ Verified Purchase</Badge>
            )}
            {review.userLocation?.distance && (
              <Badge type="distance">{review.userLocation.distance} km away</Badge>
            )}
          </UserNameRow>
          <MetaRow>
            <StarRating>
              {'⭐'.repeat(review.rating)}
            </StarRating>
            <span>•</span>
            <span>{formatDate(review.createdAt)}</span>
            {review.userLocation?.suburb && (
              <>
                <span>•</span>
                <span>{review.userLocation.suburb}</span>
              </>
            )}
          </MetaRow>
        </UserInfo>
      </Header>

      {review.title && <Title>{review.title}</Title>}
      <Content>{review.content}</Content>

      {review.photos && review.photos.length > 0 && (
        <PhotoGrid>
          {review.photos.slice(0, 6).map((photo, index) => (
            <Photo key={index} src={photo} alt={`Review photo ${index + 1}`} />
          ))}
        </PhotoGrid>
      )}

      {review.merchantResponse && (
        <MerchantResponse>
          <MerchantResponseHeader>
            🛍️ Store Owner responded:
          </MerchantResponseHeader>
          <MerchantResponseText>
            {review.merchantResponse}
          </MerchantResponseText>
        </MerchantResponse>
      )}

      <Actions>
        <ActionButton>
          👍 Helpful ({review.helpfulCount || 0})
        </ActionButton>
        <ActionButton>
          💬 Reply
        </ActionButton>
      </Actions>
    </Card>
  );
};











