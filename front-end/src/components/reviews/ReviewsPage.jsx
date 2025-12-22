import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { ReviewCard } from './ReviewCard';
import { ReviewHistoryCard } from './ReviewHistoryCard';
import { ReviewCardSkeleton } from './ReviewCardSkeleton';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xl};
  padding-top: calc(${props => props.theme.spacing.xl} + env(safe-area-inset-top));
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-size: 28px;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.background};
  color: ${props => props.$active 
    ? props.theme.colors.text.inverse 
    : props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-weight: ${props => props.$active ? 700 : 500};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  position: relative;
  
  &:hover {
    background: ${props => props.$active 
      ? props.theme.colors.primaryHover 
      : props.theme.colors.surface};
  }
`;

const TabBadge = styled.span`
  margin-left: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.text.inverse};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.pill};
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 700;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.md};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.5;
`;

const EmptyTitle = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const EmptyMessage = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  max-width: 300px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xl};
`;

const LoadingText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

import API_BASE_URL from '@config/api';

export const ReviewsPage = ({ userId = 'default' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('to-review');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    loadData();
  }, [userId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'to-review') {
        const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}/pending`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPendingReviews(data.data || []);
          } else {
            toast.error('Failed to load pending reviews');
          }
        } else {
          throw new Error('Failed to load pending reviews');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserReviews(data.data || []);
          } else {
            toast.error('Failed to load your reviews');
          }
        } else {
          throw new Error('Failed to load reviews');
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    const { orderId, orderItemId, productId, storeId, rating, content } = reviewData;
    const reviewKey = `${orderId}-${productId}`;
    
    try {
      setSubmitting(prev => ({ ...prev, [reviewKey]: true }));
      
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
          storeId,
          orderId,
          orderItemId,
          rating,
          content: content || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      if (data.success) {
        // Remove from pending and reload
        await loadData();
        return true;
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
      throw error;
    } finally {
      setSubmitting(prev => ({ ...prev, [reviewKey]: false }));
    }
  };

  const handleReviewUpdate = async (reviewId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updateData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update review');
      }

      if (data.success) {
        toast.success('Your review has been updated.');
        await loadData();
      } else {
        throw new Error(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review. Please try again.');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }

      if (data.success) {
        toast.success('Review deleted successfully.');
        await loadData();
      } else {
        throw new Error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review. Please try again.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ReviewsList>
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </ReviewsList>
      );
    }

    if (activeTab === 'to-review') {
      if (pendingReviews.length === 0) {
        return (
          <EmptyState>
            <EmptyIcon>🎉</EmptyIcon>
            <EmptyTitle>You're all caught up</EmptyTitle>
            <EmptyMessage>
              Thanks for supporting your local community.
            </EmptyMessage>
          </EmptyState>
        );
      }

      return (
        <ReviewsList>
          {pendingReviews.map((item) => (
            <ReviewCard
              key={`${item.orderId}-${item.productId}`}
              item={item}
              onSubmit={handleReviewSubmit}
              submitting={submitting[`${item.orderId}-${item.productId}`]}
            />
          ))}
        </ReviewsList>
      );
    } else {
      if (userReviews.length === 0) {
        return (
          <EmptyState>
            <EmptyIcon>⭐</EmptyIcon>
            <EmptyTitle>You haven't reviewed anything yet</EmptyTitle>
            <EmptyMessage>
              Your feedback helps local sellers grow!
            </EmptyMessage>
          </EmptyState>
        );
      }

      return (
        <ReviewsList>
          {userReviews.map((review) => (
            <ReviewHistoryCard
              key={review.id}
              review={review}
              onUpdate={handleReviewUpdate}
              onDelete={handleReviewDelete}
            />
          ))}
        </ReviewsList>
      );
    }
  };

  return (
    <Container>
      <Header>
        <Title>Reviews</Title>
        <Tabs>
          <Tab 
            $active={activeTab === 'to-review'} 
            onClick={() => setActiveTab('to-review')}
          >
            To Review
            {pendingReviews.length > 0 && (
              <TabBadge>{pendingReviews.length}</TabBadge>
            )}
          </Tab>
          <Tab 
            $active={activeTab === 'my-reviews'} 
            onClick={() => setActiveTab('my-reviews')}
          >
            My Reviews
          </Tab>
        </Tabs>
      </Header>

      <Content>
        {renderContent()}
      </Content>

      <BottomNavigation currentPath="/reviews" />
    </Container>
  );
};

