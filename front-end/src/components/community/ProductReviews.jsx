import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ReviewCard } from './ReviewCard';
import { RatingSummary } from './RatingSummary';

const Container = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.surface};
  color: ${props => props.$active 
    ? props.theme.colors.text.inverse 
    : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.$active 
      ? props.theme.colors.primaryHover 
      : props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const ProductReviews = ({ productId, location }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nearYou: false,
    recent: false,
    withPhotos: false,
    verifiedPurchase: false,
  });

  useEffect(() => {
    loadReviews();
    loadRatingSummary();
  }, [productId, location, filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const params = new URLSearchParams();
      if (locationParam) params.set('location', locationParam);
      if (filters.verifiedPurchase) params.set('verified', 'true');
      if (filters.withPhotos) params.set('images', 'true');
      if (filters.recent) params.set('recent', 'true');
      if (filters.nearYou) params.set('nearYou', 'true');

      const response = await fetch(
        `${API_BASE_URL}/community/products/${productId}/reviews?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/products/${productId}/rating?location=${locationParam}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRatingSummary(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading rating summary:', error);
    }
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  if (loading && !reviews.length) {
    return <div>Loading reviews...</div>;
  }

  return (
    <Container>
      {ratingSummary && (
        <RatingSummary summary={ratingSummary} />
      )}

      <Header>
        <Title>Reviews</Title>
        <FilterGroup>
          <FilterChip 
            $active={filters.nearYou}
            onClick={() => handleFilterChange('nearYou')}
          >
            Near You
          </FilterChip>
          <FilterChip 
            $active={filters.recent}
            onClick={() => handleFilterChange('recent')}
          >
            Recent
          </FilterChip>
          <FilterChip 
            $active={filters.withPhotos}
            onClick={() => handleFilterChange('withPhotos')}
          >
            With Photos
          </FilterChip>
          <FilterChip 
            $active={filters.verifiedPurchase}
            onClick={() => handleFilterChange('verifiedPurchase')}
          >
            Verified
          </FilterChip>
        </FilterGroup>
      </Header>

      {reviews.length === 0 ? (
        <EmptyState>
          <p>No reviews yet.</p>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            Be the first to review from your area!
          </p>
        </EmptyState>
      ) : (
        <ReviewsList>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ReviewsList>
      )}
    </Container>
  );
};











