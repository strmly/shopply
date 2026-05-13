import { useEffect, useRef, useState } from 'react';
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
import { Skeleton, SkeletonCard, SkeletonText } from '../ui/Skeleton';
import API_BASE_URL from '@config/api';

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 120px;
  background:
    radial-gradient(circle at top left, rgba(61, 129, 239, 0.14), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 38%, #f7f5ff 100%);
  animation: ${fadeIn} 0.28s ease-in;
`;

const Shell = styled.main`
  width: min(1220px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 3.6vw, 38px) 0 0;
  display: grid;
  gap: 16px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1220px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 16px;
  padding: clamp(18px, 3.4vw, 30px);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 255, 0.94)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.38), rgba(196, 184, 252, 0.4), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 28px 70px rgba(16, 24, 40, 0.11);
  overflow: hidden;
  animation: ${riseIn} 0.34s ease-out both;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const HeroMain = styled.div`
  min-width: 0;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${props => props.$dark ? props.theme.colors.gradient.dark : props.theme.colors.primarySoftBg};
  color: ${props => props.$dark ? '#ffffff' : props.theme.colors.primarySoftText};
  border: 1px solid ${props => props.$dark ? 'transparent' : 'rgba(61, 129, 239, 0.18)'};
  font-size: 12px;
  font-weight: 950;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.$open ? props.theme.colors.successBase : props.theme.colors.warningBase};
  box-shadow: 0 0 0 5px ${props => props.$open ? 'rgba(21, 161, 124, 0.12)' : 'rgba(245, 158, 11, 0.14)'};
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(34px, 6vw, 64px);
  line-height: 0.95;
  letter-spacing: 0;
  font-weight: 950;
`;

const Subtitle = styled.p`
  margin: 14px 0 0;
  max-width: 660px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 34px rgba(61, 129, 239, 0.24)' : '0 10px 24px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }
`;

const HeroPanel = styled.aside`
  display: grid;
  gap: 10px;
  align-content: stretch;
`;

const HeroMetric = styled.div`
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(61, 129, 239, 0.14);
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.07);
`;

const MetricLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 850;
`;

const MetricValue = styled.div`
  margin-top: 6px;
  color: #0d1c33;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1;
  font-weight: 950;
`;

const StoreHealth = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const HealthItem = styled.div`
  padding: 12px;
  border-radius: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid rgba(61, 129, 239, 0.1);
`;

const HealthValue = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 20px;
  font-weight: 950;
`;

const HealthLabel = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 850;
`;

const StatGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.button`
  min-height: 118px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(228, 231, 236, 0.92);
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
  text-align: left;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${riseIn} 0.36s ease-out both;
  animation-delay: ${props => props.$delay || 0}s;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(61, 129, 239, 0.26);
    box-shadow: 0 24px 54px rgba(16, 24, 40, 0.1);
  }
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const StatIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  background: ${props => props.theme.colors.gradient.primary};
`;

const StatValue = styled.div`
  margin-top: 14px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 28px;
  line-height: 1;
  font-weight: 950;
`;

const StatLabel = styled.div`
  margin-top: 6px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 850;
`;

const Workspace = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(330px, 0.75fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  min-width: 0;
  display: grid;
  gap: 16px;
`;

const Module = styled.div`
  min-width: 0;
  animation: ${riseIn} 0.38s ease-out both;
  animation-delay: ${props => props.$delay || 0}s;
`;

const OfflineBanner = styled.div`
  position: sticky;
  top: 0;
  z-index: 120;
  padding: 12px 16px;
  background: ${props => props.theme.colors.warningSoftBg};
  border-bottom: 1px solid rgba(245, 158, 11, 0.28);
  color: ${props => props.theme.colors.warningBase};
  text-align: center;
  font-size: 13px;
  font-weight: 850;
`;

const ErrorState = styled.div`
  padding: 28px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(198, 40, 80, 0.24);
  box-shadow: 0 24px 54px rgba(16, 24, 40, 0.1);
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
`;

const ErrorTitle = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const ErrorMessage = styled.p`
  margin: 8px auto 18px;
  max-width: 460px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 750;
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(330px, 0.75fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const formatMoney = (value) => `R${Number(value || 0).toLocaleString('en-ZA', {
  maximumFractionDigits: 0,
})}`;

export const SellerDashboard = ({ location }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);

  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setError(null);
      const sellerId = getSellerId();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/dashboard/${sellerId}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load dashboard (${response.status})`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || 'Invalid response format');
      }

      setDashboardData(json.data);
      setIsStoreClosed(json.data.store?.isOpen === false);
      if (json.data.store?.productCount !== undefined) {
        setProductCount(json.data.store.productCount);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.name === 'AbortError' ? 'Request timed out. Please check your connection.' : err.message || 'Failed to load dashboard data');
      if (!dashboardData) setLoading(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadProductCount = async () => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(`${API_BASE_URL}/products?storeId=${sellerId}`);
      if (!response.ok) return;
      const json = await response.json();
      if (json.success && json.data) {
        setProductCount(Array.isArray(json.data) ? json.data.length : json.data.products?.length || 0);
      }
    } catch (err) {
      console.error('Error loading product count:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadProductCount();

    intervalRef.current = setInterval(() => {
      if (isOnline) {
        loadDashboardData(false);
        loadProductCount();
      }
    }, 30000);

    const handleOnline = () => {
      setIsOnline(true);
      loadDashboardData(false);
      loadProductCount();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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

  const navProps = {
    location,
    onLocationClick: () => console.log('Location clicked'),
    onSearch: (query) => console.log('Search:', query),
    onNotificationClick: () => navigate('/'),
    onSearchClick: () => navigate('/search'),
  };

  if (loading && !dashboardData) {
    return (
      <Page>
        <TopNavigation {...navProps} />
        <Shell>
          <SkeletonCard style={{ minHeight: '260px', borderRadius: '28px' }}>
            <SkeletonText $size="large" $width="220px" />
            <SkeletonText $size="large" $width="60%" />
            <SkeletonText $width="42%" />
          </SkeletonCard>
          <StatGrid>
            {[0, 1, 2, 3].map(item => (
              <SkeletonCard key={item} style={{ minHeight: '118px', borderRadius: '22px' }}>
                <Skeleton $width="38px" $height="38px" />
                <SkeletonText $size="large" $width="80px" />
                <SkeletonText $width="120px" />
              </SkeletonCard>
            ))}
          </StatGrid>
          <LoadingGrid>
            <SkeletonCard style={{ minHeight: '280px', borderRadius: '24px' }} />
            <SkeletonCard style={{ minHeight: '280px', borderRadius: '24px' }} />
          </LoadingGrid>
        </Shell>
        <BottomNavigation currentPath="/seller/dashboard" />
      </Page>
    );
  }

  if (error && !dashboardData) {
    return (
      <Page>
        <TopNavigation {...navProps} />
        <Shell>
          <ErrorState>
            <ErrorTitle>Could not load the seller dashboard</ErrorTitle>
            <ErrorMessage>{error || 'Something went wrong. Please try again.'}</ErrorMessage>
            <Button $primary onClick={handleRetry}>Retry dashboard</Button>
          </ErrorState>
        </Shell>
        <BottomNavigation currentPath="/seller/dashboard" />
      </Page>
    );
  }

  const seller = dashboardData?.seller || {};
  const store = dashboardData?.store || {};
  const quickStats = dashboardData?.quickStats || {};
  const revenue = dashboardData?.revenue?.today || 0;
  const revenueComparison = dashboardData?.revenueComparison || null;
  const hourlyRevenue = dashboardData?.hourlyRevenue || [];
  const pendingOrders = dashboardData?.pendingOrders || { count: 0, orders: [], urgentCount: 0 };
  const lowStockProducts = dashboardData?.lowStockProducts || { products: [], criticalCount: 0 };
  const messages = dashboardData?.messages || { unreadCount: 0, messages: [] };

  const stats = [
    {
      icon: 'PR',
      value: quickStats.activeProducts ?? productCount,
      label: 'Active products',
      route: '/seller/products',
    },
    {
      icon: 'ST',
      value: quickStats.stockUnits ?? 0,
      label: 'Stock units',
      route: '/seller/products',
    },
    {
      icon: 'AL',
      value: quickStats.lowStock ?? lowStockProducts.products?.length ?? 0,
      label: 'Low-stock alerts',
      route: '/seller/products',
    },
    {
      icon: 'MS',
      value: quickStats.unreadMessages ?? messages.unreadCount ?? 0,
      label: 'Unread messages',
      route: '/seller/messages',
    },
  ];

  return (
    <Page>
      {!isOnline && (
        <OfflineBanner>You're offline. Showing last known seller data.</OfflineBanner>
      )}

      <TopNavigation {...navProps} />

      <Shell>
        <Hero>
          <HeroMain>
            <BadgeRow>
              <Badge>
                <StatusDot $open={store.isOpen !== false} />
                {store.isOpen === false ? 'Store closed' : 'Store open'}
              </Badge>
              <Badge $dark>{seller.status || 'active'} seller</Badge>
            </BadgeRow>
            <Title>{store.name || seller.storeName || 'Seller Dashboard'}</Title>
            <Subtitle>
              A modern command center for listings, orders, revenue, stock, messages, promotions, and daily store health.
            </Subtitle>
            <ActionRow>
              <Button $primary onClick={() => navigate('/seller/products/new')}>Add product</Button>
              <Button onClick={() => navigate('/seller/orders')}>Manage orders</Button>
              <Button onClick={() => navigate('/seller/promotions')}>Promotions</Button>
              <Button onClick={() => loadDashboardData(false)}>Refresh</Button>
            </ActionRow>
          </HeroMain>

          <HeroPanel>
            <HeroMetric>
              <MetricLabel>Today revenue</MetricLabel>
              <MetricValue>{formatMoney(revenue)}</MetricValue>
            </HeroMetric>
            <HeroMetric>
              <MetricLabel>Pending orders</MetricLabel>
              <MetricValue>{pendingOrders.count || 0}</MetricValue>
            </HeroMetric>
            <StoreHealth>
              <HealthItem>
                <HealthValue>{seller.rating || '4.8'}</HealthValue>
                <HealthLabel>rating</HealthLabel>
              </HealthItem>
              <HealthItem>
                <HealthValue>{lowStockProducts.criticalCount || 0}</HealthValue>
                <HealthLabel>critical stock</HealthLabel>
              </HealthItem>
              <HealthItem>
                <HealthValue>{messages.activeConversations || messages.messages?.length || 0}</HealthValue>
                <HealthLabel>threads</HealthLabel>
              </HealthItem>
            </StoreHealth>
          </HeroPanel>
        </Hero>

        <StatGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              type="button"
              $delay={0.05 * index}
              onClick={() => navigate(stat.route)}
            >
              <StatTop>
                <StatIcon>{stat.icon}</StatIcon>
              </StatTop>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatGrid>

        <Workspace>
          <Stack>
            <Module $delay={0.08}>
              <RevenueCard
                revenue={revenue}
                comparison={revenueComparison}
                hourlyRevenue={hourlyRevenue}
                onCardClick={() => navigate('/seller/analytics')}
              />
            </Module>
            <Module $delay={0.12}>
              <LowStockAlerts
                lowStockProducts={lowStockProducts}
                onProductClick={(product) => navigate(`/seller/products/${product.id}/edit`)}
              />
            </Module>
          </Stack>

          <Stack>
            <Module $delay={0.16}>
              <PendingOrdersWidget
                pendingOrders={pendingOrders}
                onViewOrders={() => navigate('/seller/orders')}
              />
            </Module>
            <Module $delay={0.2}>
              <MessagesWidget
                messages={messages}
                onViewMessages={() => navigate('/seller/messages')}
              />
            </Module>
            <Module $delay={0.24}>
              <QuickActions
                navigate={navigate}
                productCount={productCount}
                isStoreClosed={isStoreClosed}
              />
            </Module>
          </Stack>
        </Workspace>
      </Shell>

      <BottomNavigation currentPath="/seller/dashboard" />
    </Page>
  );
};
