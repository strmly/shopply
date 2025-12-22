import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 600;
  font-size: 16px;
`;

const RatingSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const AverageRating = styled.div`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 32px;
`;

const RatingDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  color: #F59E0B;
`;

const ReviewCount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
`;

export const ReviewsSection = ({ product, location }) => {
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const suburb = location?.suburb || 'your area';

  // Mock reviews (in production, fetch from API)
  const reviews = [];

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>Reviews</SectionTitle>
      </SectionHeader>

      <RatingSummary>
        <AverageRating>{rating.toFixed(1)}</AverageRating>
        <RatingDetails>
          <StarRating>
            {'⭐'.repeat(Math.floor(rating))}
            {rating % 1 >= 0.5 && '⭐'}
          </StarRating>
          <ReviewCount>
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            {location && ` from ${suburb}`}
          </ReviewCount>
        </RatingDetails>
      </RatingSummary>

      {reviews.length === 0 ? (
        <EmptyState>
          No reviews yet. Be the first to review this product!
        </EmptyState>
      ) : (
        <div>
          {/* Reviews list would go here */}
        </div>
      )}
    </Container>
  );
};











