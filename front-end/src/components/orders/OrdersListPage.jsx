import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { OrderCard } from './OrderCard';
import { BottomNavigation } from '../home/BottomNavigation';
import { OrderListSkeleton } from './SkeletonLoader';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 48%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 104px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
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

  @media (max-width: 560px) {
    width: min(100% - 24px, 1020px);
  }
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
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);
`;

const TitleBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 7vw, 52px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
  margin: 3px 0 0;
`;

const RefreshButton = styled.button`
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  padding: 12px 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(61, 129, 239, 0.2);

  &:disabled {
    opacity: 0.68;
    cursor: wait;
  }

  @media (max-width: 520px) {
    padding: 11px 13px;
    font-size: 12px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 620px) {
    grid-template-columns: repeat(3, minmax(84px, 1fr));
    overflow-x: auto;
    padding-bottom: 2px;
  }
`;

const Stat = styled.div`
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 18px;
  padding: 13px;
  min-width: 0;
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
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  position: relative;
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(228, 231, 236, 0.95)'};
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  padding: 11px 15px;
  min-height: 42px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${props => props.$active ? '0 16px 30px rgba(61, 129, 239, 0.2)' : '0 10px 20px rgba(16, 24, 40, 0.04)'};
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

  @media (max-width: 560px) {
    width: min(100% - 24px, 1020px);
  }
`;

const OrdersList = styled.div`
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
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
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
  border: 1px solid rgba(61, 129, 239, 0.18);
`;

const StateTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(22px, 5vw, 32px);
  line-height: 1;
  font-weight: 900;
`;

const StateText = styled.p`
  max-width: 360px;
  margin: 10px auto 0;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
  line-height: 1.45;
`;

const PrimaryButton = styled.button`
  margin-top: 18px;
  border: 0;
  border-radius: 999px;
  padding: 13px 18px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(61, 129, 239, 0.2);
`;

const LoadMoreButton = styled(PrimaryButton)`
  width: min(280px, 100%);
  justify-self: center;
  margin: 8px auto 0;
`;

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

const emptyCopy = {
  all: ['O', 'No orders yet', 'Your Shopply orders will appear here as soon as you send one to a seller.'],
  active: ['A', 'No active orders', 'Orders waiting on sellers, couriers, or pickup will appear here.'],
  past: ['P', 'No past orders', 'Delivered orders and reorder-ready purchases will appear here.'],
  cancelled: ['C', 'No cancelled orders', 'Cancelled orders will be kept here for reference.'],
};

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = tabs.some(tab => tab.key === searchParams.get('filter')) ? searchParams.get('filter') : 'active';
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [tabCounts, setTabCounts] = useState({ all: 0, active: 0, past: 0, cancelled: 0 });

  const userId = 'default';

  const stats = useMemo(() => ([
    { label: 'Active', value: tabCounts.active },
    { label: 'Completed', value: tabCounts.past },
    { label: 'Total', value: tabCounts.all },
  ]), [tabCounts]);

  const fetchOrderPage = useCallback(async (filter, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/my-orders/user/${userId}?filter=${filter}&page=${page}&limit=8`);
    if (!response.ok) throw new Error(`Failed to load orders: ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to load orders');
    return data;
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const results = await Promise.all(tabs.map(tab => fetchOrderPage(tab.key, 1)));
      const next = {};
      tabs.forEach((tab, index) => {
        next[tab.key] = results[index].pagination?.total ?? results[index].data?.length ?? 0;
      });
      setTabCounts(next);
    } catch (err) {
      console.error('Error loading order counts:', err);
    }
  }, [fetchOrderPage]);

  const loadOrders = useCallback(async ({ page = 1, append = false, refresh = false } = {}) => {
    try {
      if (append) setLoadingMore(true);
      else if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchOrderPage(activeTab, page);
      setOrders(prev => append ? [...prev, ...(data.data || [])] : (data.data || []));
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      if (!append) setOrders([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab, fetchOrderPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts, orders.length]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ filter: tab });
  };

  const [mark, title, text] = emptyCopy[activeTab] || emptyCopy.all;

  return (
    <Container>
      <Header>
        <HeaderInner>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleBlock>
              <Eyebrow>Shopply orders</Eyebrow>
              <Title>My Orders</Title>
            </TitleBlock>
            <RefreshButton onClick={() => loadOrders({ refresh: true })} disabled={refreshing || loading}>
              {refreshing ? 'Refreshing' : 'Refresh'}
            </RefreshButton>
          </HeaderTop>

          <StatsGrid>
            {stats.map(stat => (
              <Stat key={stat.label}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </Stat>
            ))}
          </StatsGrid>

          <Tabs aria-label="Order filters">
            {tabs.map(tab => (
              <Tab key={tab.key} $active={activeTab === tab.key} onClick={() => handleTabChange(tab.key)}>
                {tab.label}
                <Count $active={activeTab === tab.key}>{tabCounts[tab.key] || 0}</Count>
              </Tab>
            ))}
          </Tabs>
        </HeaderInner>
      </Header>

      <Content>
        {loading ? (
          <OrdersList>
            <OrderListSkeleton />
          </OrdersList>
        ) : error ? (
          <StatePanel>
            <div>
              <StateMark>!</StateMark>
              <StateTitle>Orders could not load</StateTitle>
              <StateText>{error}</StateText>
              <PrimaryButton onClick={() => loadOrders()}>Try again</PrimaryButton>
            </div>
          </StatePanel>
        ) : orders.length === 0 ? (
          <StatePanel>
            <div>
              <StateMark>{mark}</StateMark>
              <StateTitle>{title}</StateTitle>
              <StateText>{text}</StateText>
              {(activeTab === 'all' || activeTab === 'active') && (
                <PrimaryButton onClick={() => navigate('/search')}>Shop nearby</PrimaryButton>
              )}
            </div>
          </StatePanel>
        ) : (
          <OrdersList>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onClick={(selected) => navigate(`/orders/${selected.id}`)} />
            ))}
            {pagination?.hasMore && (
              <LoadMoreButton
                disabled={loadingMore}
                onClick={() => loadOrders({ page: (pagination.page || 1) + 1, append: true })}
              >
                {loadingMore ? 'Loading...' : 'Load more orders'}
              </LoadMoreButton>
            )}
          </OrdersList>
        )}
      </Content>

      <BottomNavigation currentPath="/orders" />
    </Container>
  );
};
