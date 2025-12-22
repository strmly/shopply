import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { OrderCard } from './OrderCard';
import { BottomNavigation } from '../home/BottomNavigation';
import { OrderListSkeleton } from './SkeletonLoader';

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

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${props => props.theme.colors.danger[500]};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.circle};
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.5;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.sm};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const ErrorText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

const RetryButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.sm};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PullToRefresh = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
  opacity: ${props => props.$isRefreshing ? 1 : 0};
  transition: opacity 0.3s;
`;

import API_BASE_URL from '@config/api';

export const OrdersListPage = ({ location }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    past: 0,
    cancelled: 0,
  });
  const [pagination, setPagination] = useState(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const userId = 'default'; // In production, get from auth context

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  // Pull to refresh handler
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isPulling.current && window.scrollY === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 50 && !refreshing) {
        setRefreshing(true);
        loadOrders(true).finally(() => {
          setRefreshing(false);
          isPulling.current = false;
        });
      }
    }
  }, [refreshing]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleTouchStart, handleTouchMove]);

  const loadOrders = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const filter = activeTab === 'all' ? 'all' : activeTab;
      const response = await fetch(`${API_BASE_URL}/my-orders/user/${userId}?filter=${filter}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`Failed to load orders: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Load counts for all tabs
    const loadCounts = async () => {
      try {
        const [activeRes, pastRes, cancelledRes] = await Promise.all([
          fetch(`${API_BASE_URL}/my-orders/user/${userId}?filter=active`),
          fetch(`${API_BASE_URL}/my-orders/user/${userId}?filter=past`),
          fetch(`${API_BASE_URL}/my-orders/user/${userId}?filter=cancelled`),
        ]);

        const [activeData, pastData, cancelledData] = await Promise.all([
          activeRes.json(),
          pastRes.json(),
          cancelledRes.json(),
        ]);

        setTabCounts({
          active: activeData.data?.length || 0,
          past: pastData.data?.length || 0,
          cancelled: cancelledData.data?.length || 0,
        });
      } catch (error) {
        console.error('Error loading tab counts:', error);
      }
    };

    loadCounts();
  }, []);

  const renderEmptyState = () => {
    if (activeTab === 'active') {
      return (
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>No active orders</EmptyTitle>
          <EmptyText>Your orders will appear here once you place them.</EmptyText>
          <ActionButton onClick={() => navigate('/')}>
            Start Shopping
          </ActionButton>
        </EmptyState>
      );
    }

    if (activeTab === 'past') {
      return (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>No past orders</EmptyTitle>
          <EmptyText>Your completed orders will appear here.</EmptyText>
        </EmptyState>
      );
    }

    return (
      <EmptyState>
        <EmptyIcon>🚫</EmptyIcon>
        <EmptyTitle>No cancelled orders</EmptyTitle>
        <EmptyText>You haven't cancelled any orders.</EmptyText>
      </EmptyState>
    );
  };

  return (
    <Container>
      <Header>
        <Title>My Orders</Title>
        <Tabs>
          <Tab 
            $active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')}
          >
            Active
            {tabCounts.active > 0 && <Badge>{tabCounts.active}</Badge>}
          </Tab>
          <Tab 
            $active={activeTab === 'past'} 
            onClick={() => setActiveTab('past')}
          >
            Past
            {tabCounts.past > 0 && <Badge>{tabCounts.past}</Badge>}
          </Tab>
          <Tab 
            $active={activeTab === 'cancelled'} 
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
            {tabCounts.cancelled > 0 && <Badge>{tabCounts.cancelled}</Badge>}
          </Tab>
        </Tabs>
      </Header>

      <Content ref={containerRef}>
        {refreshing && (
          <PullToRefresh $isRefreshing={refreshing}>
            Refreshing...
          </PullToRefresh>
        )}
        
        {loading ? (
          <OrdersList>
            <OrderListSkeleton />
          </OrdersList>
        ) : error ? (
          <ErrorState>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            <RetryButton onClick={() => loadOrders()}>
              Retry
            </RetryButton>
          </ErrorState>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <OrdersList>
            {orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order}
                onClick={(order) => navigate(`/orders/${order.id}`)}
              />
            ))}
            {pagination?.hasMore && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <RetryButton 
                  onClick={() => loadOrders()}
                  style={{ background: 'transparent', color: 'inherit', border: '1px solid' }}
                >
                  Load More
                </RetryButton>
              </div>
            )}
          </OrdersList>
        )}
      </Content>

      <BottomNavigation currentPath="/orders" />
    </Container>
  );
};

