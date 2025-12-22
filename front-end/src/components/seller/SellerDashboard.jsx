import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TopNavigation } from '../home/TopNavigation';
import { BottomNavigation } from '../home/BottomNavigation';
import { RevenueCard } from './dashboard/RevenueCard';
import { PendingOrdersWidget } from './dashboard/PendingOrdersWidget';
import { LowStockAlerts } from './dashboard/LowStockAlerts';
import { MessagesWidget } from './dashboard/MessagesWidget';
import { QuickActions } from './dashboard/QuickActions';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../ui/Skeleton';

const staggerDelay = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.md};
  }
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  animation: ${staggerDelay} 0.3s ease-out;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 28px;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin: 0;
`;

const Module = styled.div`
  animation: ${staggerDelay} 0.4s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const SkeletonRevenueCard = styled(SkeletonCard)`
  background: linear-gradient(135deg, #3D81EF 0%, #7EC1F6 100%);
  min-height: 180px;
  padding: ${props => props.theme.spacing.xl};
`;

const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const OfflineBanner = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.warningSoftBg};
  border-bottom: 2px solid ${props => props.theme.colors.warningBase};
  color: ${props => props.theme.colors.warningBase};
  text-align: center;
  ${props => props.theme.typography.body2}
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.dangerSoftBg};
  border: 2px solid ${props => props.theme.colors.dangerBase};
  border-radius: ${props => props.theme.radii.lg};
  color: ${props => props.theme.colors.dangerBase};
  text-align: center;
  ${props => props.theme.typography.body2}
  box-shadow: ${props => props.theme.shadows.md};
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ErrorTitle = styled.div`
  ${props => props.theme.typography.heading3}
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.dangerBase};
`;

const ErrorMessage = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 13px;
`;

const RetryButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.dangerBase};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  ${props => props.theme.typography.button}
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.sm};
  min-height: 44px;

  &:hover {
    background: ${props => props.theme.colors.dangerHover || '#A3203D'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

import API_BASE_URL from '@config/api';

export const SellerDashboard = ({ location }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);

  // Get seller ID from localStorage (set during onboarding)
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1'; // Default to 1 for demo
  };

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setError(null);
      }
      const sellerId = getSellerId();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/dashboard/${sellerId}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load dashboard (${response.status})`);
      }

      const json = await response.json();
      
      if (json.success && json.data) {
        setDashboardData(json.data);
        setError(null);
      } else {
        throw new Error(json.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
      
      // Don't clear existing data on refresh errors
      if (!dashboardData) {
        setLoading(false);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadProductCount = async () => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(`${API_BASE_URL}/products?storeId=${sellerId}`);
      
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setProductCount(Array.isArray(json.data) ? json.data.length : json.data.products?.length || 0);
        }
      }
    } catch (err) {
      console.error('Error loading product count:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadProductCount();

    // Set up real-time updates every 30 seconds (silent refresh)
    intervalRef.current = setInterval(() => {
      if (isOnline) {
        loadDashboardData(false); // Silent refresh - don't show loading state
        loadProductCount();
      }
    }, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      loadDashboardData(false);
      loadProductCount();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setDashboardData(null);
    loadDashboardData(true);
    loadProductCount();
  };

  if (loading && !dashboardData) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <Content>
          <Header>
            <SkeletonText $size="large" $width="200px" />
            <SkeletonText $size="small" $width="150px" style={{ marginTop: '8px' }} />
          </Header>

          <LoadingState>
            <SkeletonRevenueCard>
              <SkeletonContent>
                <SkeletonText $size="small" $width="120px" style={{ opacity: 0.8 }} />
                <SkeletonText $size="large" $width="180px" style={{ marginTop: '8px' }} />
                <SkeletonText $size="small" $width="100px" style={{ marginTop: '8px', opacity: 0.8 }} />
              </SkeletonContent>
            </SkeletonRevenueCard>

            <SkeletonCard>
              <SkeletonText $size="large" $width="140px" />
              <SkeletonText $width="80%" />
              <SkeletonText $width="60%" />
              <SkeletonButton style={{ marginTop: '12px' }} />
            </SkeletonCard>

            <SkeletonCard>
              <SkeletonText $size="large" $width="140px" />
              <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
                <Skeleton $width="200px" $height="80px" />
                <Skeleton $width="200px" $height="80px" />
              </div>
            </SkeletonCard>

            <SkeletonCard>
              <SkeletonText $size="large" $width="100px" />
              <SkeletonText $width="90%" />
              <SkeletonText $width="70%" />
            </SkeletonCard>

            <SkeletonCard>
              <SkeletonText $size="large" $width="120px" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px' }}>
                <Skeleton $height="100px" />
                <Skeleton $height="100px" />
                <Skeleton $height="100px" />
                <Skeleton $height="100px" />
              </div>
            </SkeletonCard>
          </LoadingState>
        </Content>
        <BottomNavigation currentPath="/seller/dashboard" />
      </Container>
    );
  }

  if (error && !dashboardData) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <Content>
          <ErrorState>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Couldn't load dashboard</ErrorTitle>
            <ErrorMessage>
              {error || 'Something went wrong. Please try again.'}
            </ErrorMessage>
            <RetryButton onClick={handleRetry}>
              Retry
            </RetryButton>
          </ErrorState>
        </Content>
        <BottomNavigation currentPath="/seller/dashboard" />
      </Container>
    );
  }

  const revenue = dashboardData?.revenue?.today || 0;
  const revenueComparison = dashboardData?.revenueComparison || null;
  const hourlyRevenue = dashboardData?.hourlyRevenue || [];
  const pendingOrders = dashboardData?.pendingOrders || { count: 0, orders: [], urgentCount: 0 };
  const lowStockProducts = dashboardData?.lowStockProducts || { products: [], criticalCount: 0 };
  const messages = dashboardData?.messages || { unreadCount: 0, messages: [] };

  return (
    <Container>
      {!isOnline && (
        <OfflineBanner>
          ⚠️ You're offline. Showing last known data.
        </OfflineBanner>
      )}
      
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      
      <Content>
        <Header>
          <Title>Seller Dashboard</Title>
          <Subtitle>Manage your store and track performance</Subtitle>
        </Header>

        {/* Revenue Card - Highest Priority */}
        <Module $delay={0.1} aria-live="polite" aria-atomic="true">
          <RevenueCard 
            revenue={revenue}
            comparison={revenueComparison}
            hourlyRevenue={hourlyRevenue}
            onCardClick={() => navigate('/seller/analytics')}
          />
        </Module>

        {/* Pending Orders - Second Priority */}
        <Module $delay={0.2}>
          <PendingOrdersWidget 
            pendingOrders={pendingOrders}
            onViewOrders={() => navigate('/seller/orders')}
          />
        </Module>

        {/* Low Stock Alerts - Third Priority */}
        <Module $delay={0.3}>
          <LowStockAlerts 
            lowStockProducts={lowStockProducts}
            onProductClick={(product) => navigate(`/seller/products/${product.id}/edit`)}
          />
        </Module>

        {/* Messages - Fourth Priority */}
        <Module $delay={0.4}>
          <MessagesWidget 
            messages={messages}
            onViewMessages={() => navigate('/seller/messages')}
          />
        </Module>

        {/* Quick Actions - Fifth Priority */}
        <Module $delay={0.5}>
          <QuickActions 
            navigate={navigate}
            productCount={productCount}
            isStoreClosed={isStoreClosed}
          />
        </Module>
      </Content>
      
      <BottomNavigation currentPath="/seller/dashboard" />
    </Container>
  );
};
