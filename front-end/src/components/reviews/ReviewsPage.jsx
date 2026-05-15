import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { ReviewCard } from './ReviewCard';
import { ReviewHistoryCard } from './ReviewHistoryCard';
import { ReviewCardSkeleton } from './ReviewCardSkeleton';
import { toast } from '../ui/Toast';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 104px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeaderInner = styled.div`
  width: min(1020px, calc(100% - 32px));
  margin: 0 auto;
  padding: calc(18px + env(safe-area-inset-top)) 0 18px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
`;

const TitleBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 3px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 7vw, 52px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 620px) {
    grid-template-columns: repeat(3, minmax(92px, 1fr));
    overflow-x: auto;
  }
`;

const Stat = styled.div`
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 18px;
  padding: 13px;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  margin-top: 5px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  padding: 11px 15px;
  min-height: 42px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
`;

const Count = styled.span`
  margin-left: 8px;
  padding: 2px 7px;
  border-radius: 999px;
  background: ${props => props.$active ? 'rgba(255,255,255,0.22)' : props.theme.colors.primarySoftBg};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.primarySoftText};
`;

const Content = styled.main`
  width: min(1020px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 0;
`;

const List = styled.div`
  display: grid;
  gap: 14px;
`;

const StatePanel = styled.div`
  min-height: 330px;
  display: grid;
  place-items: center;
  text-align: center;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  padding: 34px 20px;
  box-shadow: 0 24px 54px rgba(16, 24, 40, 0.08);
`;

const StateMark = styled.div`
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  border-radius: 24px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
`;

const StateTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(22px, 5vw, 32px);
  line-height: 1;
  font-weight: 900;
`;

const StateText = styled.p`
  max-width: 380px;
  margin: 10px auto 0;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
  line-height: 1.45;
`;

export const ReviewsPage = ({ userId = 'default' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = ['to-review', 'my-reviews'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'to-review';
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingRes, reviewsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reviews/user/${userId}/pending`),
        fetch(`${API_BASE_URL}/reviews/user/${userId}`),
        fetch(`${API_BASE_URL}/reviews/user/${userId}/summary`),
      ]);
      const [pendingData, reviewsData, summaryData] = await Promise.all([pendingRes.json(), reviewsRes.json(), summaryRes.json()]);
      if (!pendingRes.ok || !pendingData.success) throw new Error(pendingData.message || 'Failed to load pending reviews');
      if (!reviewsRes.ok || !reviewsData.success) throw new Error(reviewsData.message || 'Failed to load reviews');
      setPendingReviews(pendingData.data || []);
      setUserReviews(reviewsData.data || []);
      setSummary(summaryData.success ? summaryData.data : null);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const avg = userReviews.length
      ? (userReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / userReviews.length).toFixed(1)
      : '0.0';
    return [
      { label: 'To review', value: summary?.pendingCount ?? pendingReviews.length },
      { label: 'Written', value: summary?.totalReviews ?? userReviews.length },
      { label: 'Average', value: avg },
    ];
  }, [pendingReviews.length, summary, userReviews]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleReviewSubmit = async (reviewData) => {
    const reviewKey = `${reviewData.orderId}-${reviewData.productId}`;
    try {
      setSubmitting(prev => ({ ...prev, [reviewKey]: true }));
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...reviewData, content: reviewData.content || '' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to submit review');
      toast.success('Review submitted');
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
      throw err;
    } finally {
      setSubmitting(prev => ({ ...prev, [reviewKey]: false }));
    }
  };

  const handleReviewUpdate = async (reviewId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updateData }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update review');
      toast.success('Review updated');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update review');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete review');
      toast.success('Review deleted');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <List>{[1, 2, 3].map(i => <ReviewCardSkeleton key={i} />)}</List>;
    }
    if (error) {
      return <StatePanel><div><StateMark>!</StateMark><StateTitle>Reviews could not load</StateTitle><StateText>{error}</StateText></div></StatePanel>;
    }
    if (activeTab === 'to-review') {
      if (pendingReviews.length === 0) {
        return <StatePanel><div><StateMark>R</StateMark><StateTitle>You are all caught up</StateTitle><StateText>Delivered items that need feedback will appear here.</StateText></div></StatePanel>;
      }
      return (
        <List>
          {pendingReviews.map(item => (
            <ReviewCard
              key={`${item.orderId}-${item.productId}`}
              item={item}
              onSubmit={handleReviewSubmit}
              submitting={submitting[`${item.orderId}-${item.productId}`]}
            />
          ))}
        </List>
      );
    }
    if (userReviews.length === 0) {
      return <StatePanel><div><StateMark>R</StateMark><StateTitle>No reviews yet</StateTitle><StateText>Your feedback helps local sellers improve and helps nearby shoppers choose well.</StateText></div></StatePanel>;
    }
    return (
      <List>
        {userReviews.map(review => (
          <ReviewHistoryCard key={review.id} review={review} onUpdate={handleReviewUpdate} onDelete={handleReviewDelete} />
        ))}
      </List>
    );
  };

  return (
    <Container>
      <Header>
        <HeaderInner>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleBlock>
              <Eyebrow>Shopply community</Eyebrow>
              <Title>Reviews</Title>
            </TitleBlock>
          </HeaderTop>
          <StatsGrid>
            {stats.map(stat => (
              <Stat key={stat.label}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </Stat>
            ))}
          </StatsGrid>
          <Tabs>
            <Tab $active={activeTab === 'to-review'} onClick={() => handleTabChange('to-review')}>
              To Review<Count $active={activeTab === 'to-review'}>{pendingReviews.length}</Count>
            </Tab>
            <Tab $active={activeTab === 'my-reviews'} onClick={() => handleTabChange('my-reviews')}>
              My Reviews<Count $active={activeTab === 'my-reviews'}>{userReviews.length}</Count>
            </Tab>
          </Tabs>
        </HeaderInner>
      </Header>
      <Content>{renderContent()}</Content>
      <BottomNavigation currentPath="/reviews" />
    </Container>
  );
};
