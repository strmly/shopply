import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RatingDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const RatingNumber = styled.div`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 48px;
  line-height: 1;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 20px;
`;

const ReviewCount = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const LocalInfo = styled.div`
  flex: 1;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.5;
`;

const Distribution = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const DistributionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.caption}
  font-size: 12px;
`;

const StarLabel = styled.div`
  width: 60px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Bar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const Count = styled.div`
  width: 40px;
  text-align: right;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

export const RatingSummary = ({ summary }) => {
  if (!summary) return null;

  const { averageRating, totalReviews, localReviews, ratingDistribution } = summary;
  const total = ratingDistribution ? Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <Card>
      <SummaryRow>
        <RatingDisplay>
          <RatingNumber>{averageRating}</RatingNumber>
          <StarRating>
            {'⭐'.repeat(Math.floor(averageRating))}
            {averageRating % 1 >= 0.5 && '✨'}
          </StarRating>
          <ReviewCount>({totalReviews} reviews)</ReviewCount>
        </RatingDisplay>
        <LocalInfo>
          {localReviews > 0 ? (
            <>
              <strong>{localReviews}</strong> reviews from buyers within 3km
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                {Math.round((localReviews / totalReviews) * 100)}% from your area
              </span>
            </>
          ) : (
            <span>Be the first to review from your area!</span>
          )}
        </LocalInfo>
      </SummaryRow>

      {total > 0 && ratingDistribution && (
        <Distribution>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <DistributionRow key={rating}>
                <StarLabel>
                  {rating} ⭐
                </StarLabel>
                <Bar>
                  <BarFill percentage={percentage} />
                </Bar>
                <Count>{count}</Count>
              </DistributionRow>
            );
          })}
        </Distribution>
      )}
    </Card>
  );
};











