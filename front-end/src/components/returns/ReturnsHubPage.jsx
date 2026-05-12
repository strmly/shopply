import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ReturnStatusCard } from './ReturnStatusCard';
import { TimelineStepper } from './TimelineStepper';
import { ReturnListSkeleton } from './ReturnCardSkeleton';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  flex: 1;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.surface};
  padding: 0 ${props => props.theme.spacing.md};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.text.secondary};
  border-bottom-color: ${props => props.$active 
    ? props.theme.colors.primary 
    : 'transparent'};
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;
  position: relative;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const TabBadge = styled.span`
  margin-left: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.pill};
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 700;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.3s ease-in;
`;

const ReturnsList = styled.div`
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
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PullToRefresh = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  transition: transform 0.3s ease;
  transform: translateY(${props => props.$pulling ? '0' : '-100%'});
  opacity: ${props => props.$pulling ? '1' : '0'};
  position: sticky;
  top: 0;
  z-index: 5;
  background: ${props => props.theme.colors.background};
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger[100]};
  border: 1px solid ${props => props.theme.colors.danger[300]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.danger[600]};
  ${props => props.theme.typography.body2}
`;

import API_BASE_URL from '@config/api';

export const ReturnsHubPage = ({ location }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    completed: 0,
    cancelled: 0,
  });

  const userId = 'default'; // In production, get from auth context
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef(null);

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isPulling.current && window.scrollY === 0) {
      const touchY = e.touches[0].clientY;
      touchEndY.current = touchY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 50) {
        setPulling(true);
      }
    }
  }, []);

  const loadReturns = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const filter = activeTab === 'active' ? 'active' : activeTab;
      const response = await fetch(`${API_BASE_URL}/returns/user/${userId}?filter=${filter}&limit=50`);

      if (!response.ok) {
        throw new Error(`Failed to load returns: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setReturns(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load returns');
      }
    } catch (error) {
      console.error('Error loading returns:', error);
      setError(error.message);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, userId]);

  const loadTabCounts = useCallback(async () => {
    try {
      const [activeRes, completedRes, cancelledRes] = await Promise.all([
        fetch(`${API_BASE_URL}/returns/user/${userId}?filter=active`),
        fetch(`${API_BASE_URL}/returns/user/${userId}?filter=completed`),
        fetch(`${API_BASE_URL}/returns/user/${userId}?filter=cancelled`),
      ]);

      const [activeData, completedData, cancelledData] = await Promise.all([
        activeRes.json(),
        completedRes.json(),
        cancelledRes.json(),
      ]);

      setTabCounts({
        active: activeData.data?.length || 0,
        completed: completedData.data?.length || 0,
        cancelled: cancelledData.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading tab counts:', error);
    }
  }, [userId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPulling(false);
    await Promise.all([loadReturns(false), loadTabCounts()]);
    setRefreshing(false);
  }, [loadReturns, loadTabCounts]);

  const handleTouchEnd = useCallback(() => {
    if (isPulling.current && window.scrollY === 0) {
      const pullDistance = touchEndY.current - touchStartY.current;
      if (pullDistance > 100 && !refreshing) {
        handleRefresh();
      }
    }
    setPulling(false);
    isPulling.current = false;
    touchEndY.current = 0;
  }, [refreshing, handleRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    loadReturns();
    loadTabCounts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadReturns(false);
      loadTabCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, loadReturns, loadTabCounts]);

  const handleReturnClick = (returnItem) => {
    navigate(`/returns/${returnItem.id}`);
  };

  const renderContent = () => {
    if (loading && returns.length === 0) {
      return (
        <LoadingState>
          <ReturnListSkeleton />
        </LoadingState>
      );
    }

    if (error) {
      return (
        <ErrorState>
          {error}
        </ErrorState>
      );
    }

    if (returns.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            {activeTab === 'active' ? '📦' : activeTab === 'completed' ? '✅' : '❌'}
          </EmptyIcon>
          <EmptyTitle>
            {activeTab === 'active' 
              ? "You don't have any active returns" 
              : activeTab === 'completed'
                ? 'No completed returns'
                : 'No cancelled returns'}
          </EmptyTitle>
          <EmptyMessage>
            {activeTab === 'active' 
              ? "We hope everything you ordered was perfect 🙂"
              : activeTab === 'completed'
                ? 'Completed returns will appear here'
                : 'Cancelled returns will appear here'}
          </EmptyMessage>
        </EmptyState>
      );
    }

    if (activeTab === 'timeline' && returns.length > 0) {
      // Show timeline view for the first active return
      const firstReturn = returns[0];
      return (
        <Content>
          <TimelineStepper 
            returnItem={firstReturn}
            onReturnClick={() => handleReturnClick(firstReturn)}
          />
        </Content>
      );
    }

    return (
      <ReturnsList>
        {returns.map((returnItem, index) => (
          <ReturnStatusCard
            key={returnItem.id}
            returnItem={returnItem}
            onClick={() => handleReturnClick(returnItem)}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </ReturnsList>
    );
  };

  const tabs = [
    { id: 'active', label: 'Active', count: tabCounts.active },
    { id: 'timeline', label: 'Timeline', count: null },
    { id: 'completed', label: 'History', count: tabCounts.completed },
  ].filter(tab => {
    // Only show tabs that have content or are always visible
    if (tab.id === 'timeline') return true; // Always show timeline
    return tab.count > 0 || activeTab === tab.id; // Show if has content or is active
  });

  return (
    <Container ref={containerRef}>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate(-1)}>
            ←
          </BackButton>
          <Title>Returns & Refunds</Title>
        </HeaderContent>
        {tabs.length > 0 && (
          <Tabs>
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <TabBadge>{tab.count}</TabBadge>
                )}
              </Tab>
            ))}
          </Tabs>
        )}
      </Header>
      <PullToRefresh $pulling={pulling || refreshing}>
        {refreshing ? 'Refreshing...' : '↓ Pull to refresh'}
      </PullToRefresh>
      <Content>
        {renderContent()}
      </Content>
    </Container>
  );
};

