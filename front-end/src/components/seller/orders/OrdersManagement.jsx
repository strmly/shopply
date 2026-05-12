import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { OrderCard } from './OrderCard';
import { SkeletonCard, SkeletonText } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';

const slideIn = keyframes`
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
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
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

const FilterTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  overflow-x: auto;
  padding: ${props => props.theme.spacing.xs} 0;
  margin-bottom: ${props => props.theme.spacing.sm};
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-left: 48px;
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  ${props => props.theme.typography.body1}
  background: ${props => props.theme.colors.surface};
  transition: ${props => props.theme.transitions.swift};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
`;

const RefreshButton = styled.button`
  position: fixed;
  bottom: 120px;
  right: ${props => props.theme.spacing.md};
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.xl};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const FilterTab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.pill};
  border: 2px solid ${props => 
    props.$active ? props.theme.colors.primary : props.theme.colors.border.light
  };
  background: ${props => 
    props.$active ? props.theme.colors.primary : props.theme.colors.surface
  };
  color: ${props => 
    props.$active ? 'white' : props.theme.colors.text.secondary
  };
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => 
      props.$active ? props.theme.colors.primaryHover : props.theme.colors.primarySoftBg
    };
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  animation: ${slideIn} 0.3s ease-out;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EmptyTitle = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyMessage = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const UrgentBanner = styled.div`
  background: ${props => props.theme.colors.dangerSoftBg};
  border-left: 4px solid ${props => props.theme.colors.dangerBase};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${slideIn} 0.3s ease-out;
`;

const UrgentMessage = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.dangerBase};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.dangerHover || '#A3203D'};
    transform: translateY(-1px);
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

import API_BASE_URL from '@config/api';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'new', label: 'New' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'courier_assigned', label: 'In Transit' },
  { value: 'completed', label: 'Completed' },
];

export const OrdersManagement = ({ location }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [urgentCount, setUrgentCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);
  
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };
  
  const loadOrders = async (showLoading = true, showToast = false) => {
    try {
      if (showLoading) {
        setError(null);
      }
      
      const sellerId = getSellerId();
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }
      
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/orders?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load orders (${response.status})`);
      }
      
      const json = await response.json();
      
      if (json.success && json.data) {
        const prevCount = orders.length;
        setOrders(json.data);
        
        // Count urgent orders
        const urgent = json.data.filter(order => 
          order.slaStatus?.isUrgent || order.slaStatus?.isOverdue
        ).length;
        setUrgentCount(urgent);
        
        // Show toast if new orders arrived
        if (showToast && json.data.length > prevCount && prevCount > 0) {
          const newCount = json.data.length - prevCount;
          toast.info(`${newCount} new ${newCount === 1 ? 'order' : 'orders'} received!`);
        }
      } else {
        throw new Error(json.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      if (showLoading) {
        setLoading(false);
      }
      if (showToast) {
        toast.error('Failed to refresh orders');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(false, true);
    setRefreshing(false);
    toast.success('Orders refreshed');
  };
  
  useEffect(() => {
    loadOrders();
    
    // Set up real-time updates every 30 seconds
    intervalRef.current = setInterval(() => {
      loadOrders(false, true);
    }, 30000);
    
    // Pull-to-refresh support
    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = () => {
      const pullDistance = touchStartY - touchEndY;
      if (pullDistance > 100 && window.scrollY === 0) {
        handleRefresh();
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeFilter]);
  
  const handleOrderClick = (order) => {
    navigate(`/seller/orders/${order.id}`);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setLoading(true);
  };
  
  const filteredOrders = useMemo(() => {
    let filtered = activeFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === activeFilter);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.buyerName?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query) ||
        order.buyerPhone?.includes(query) ||
        order.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [orders, activeFilter, searchQuery]);
  
  const overdueOrders = orders.filter(order => order.slaStatus?.isOverdue);
  
  if (loading && orders.length === 0) {
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
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} style={{ minHeight: '120px' }} />
            ))}
          </LoadingState>
        </Content>
        <BottomNavigation currentPath="/seller/orders" />
      </Container>
    );
  }
  
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
          <Title>Orders Management</Title>
          <Subtitle>Manage and track all your orders</Subtitle>
        </Header>
        
        {overdueOrders.length > 0 && (
          <UrgentBanner>
            <UrgentMessage>
              {overdueOrders.length} {overdueOrders.length === 1 ? 'order' : 'orders'} overdue — action needed
            </UrgentMessage>
            <ViewButton onClick={() => setActiveFilter('delayed')}>
              View
            </ViewButton>
          </UrgentBanner>
        )}
        
        <SearchBar>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by customer name, order ID, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        
        <FilterTabs>
          {FILTER_OPTIONS.map(option => (
            <FilterTab
              key={option.value}
              $active={activeFilter === option.value}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </FilterTab>
          ))}
        </FilterTabs>
        
        {error && (
          <div style={{ 
            padding: '16px', 
            background: '#FEF3F2', 
            border: '2px solid #F04438', 
            borderRadius: '12px',
            color: '#F04438',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyTitle>
              {activeFilter === 'all' 
                ? 'No orders right now' 
                : `No ${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label.toLowerCase()} orders`}
            </EmptyTitle>
            <EmptyMessage>
              {activeFilter === 'all' 
                ? "Keep your store ready for customers! 🚀"
                : "All caught up on this status!"}
            </EmptyMessage>
          </EmptyState>
        ) : (
          <OrdersList>
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order)}
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </OrdersList>
        )}
      </Content>
      
      <RefreshButton 
        onClick={handleRefresh}
        disabled={refreshing}
        title="Refresh orders"
      >
        {refreshing ? '⟳' : '↻'}
      </RefreshButton>
      
      <BottomNavigation currentPath="/seller/orders" />
    </Container>
  );
};

