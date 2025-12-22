import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { KPICards } from './KPICards';
import { SalesHeatmap } from './SalesHeatmap';
import { TimeSeriesChart } from './TimeSeriesChart';
import { ProductPerformance } from './ProductPerformance';
import { CustomerDemographics } from './CustomerDemographics';
import { SkeletonCard } from '../../ui/Skeleton';

import API_BASE_URL from '@config/api';

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

const RefreshButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Module = styled.div`
  animation: ${fadeIn} 0.4s ease-out ${props => props.$delay || 0}s both;
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.status.errorLight};
  color: ${props => props.theme.colors.status.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  text-align: center;
`;

export const AnalyticsPage = ({ location }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    overview: null,
    heatmap: null,
    timeSeries: null,
    productPerformance: null,
    demographics: null
  });

  // Get seller ID from localStorage or use default for demo
  // Try multiple keys to match other components
  const getSellerId = () => {
    return localStorage.getItem('sellerOnboardingId') || 
           localStorage.getItem('sellerId') || 
           '1'; // Default to 1 for demo
  };

  const sellerId = getSellerId();

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async (period = '7d', refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Add timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const refreshParam = refresh ? '&refresh=true' : '';
      const response = await fetch(`${API_BASE_URL}/analytics/${sellerId}/all?period=${period}${refreshParam}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load analytics (${response.status})`);
      }
      
      const result = await response.json();
      
      console.log('Analytics API Response:', result); // Debug log
      console.log('Seller ID used:', sellerId); // Debug log
      
      if (result.success && result.data) {
        console.log('Analytics data received:', {
          hasOverview: !!result.data.overview,
          hasHeatmap: !!result.data.heatmap,
          hasTimeSeries: !!result.data.timeSeries,
          hasProductPerformance: !!result.data.productPerformance,
          hasDemographics: !!result.data.demographics
        });
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please check if the backend is running on http://localhost:5000');
      } else {
        setError(err.message || 'Failed to load analytics. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics('7d', true);
  };

  if (loading) {
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
            <Title>Analytics</Title>
            <Subtitle>Track your store performance</Subtitle>
          </Header>
          <SkeletonCard height="200px" />
          <SkeletonCard height="400px" />
          <SkeletonCard height="300px" />
        </Content>
        <BottomNavigation currentPath="/seller/analytics" />
      </Container>
    );
  }

  if (error) {
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
            <Title>Analytics</Title>
            <Subtitle>Track your store performance</Subtitle>
          </Header>
          <ErrorMessage>
            {error}. Please try again later.
          </ErrorMessage>
        </Content>
        <BottomNavigation currentPath="/seller/analytics" />
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
          <div>
            <Title>Analytics</Title>
            <Subtitle>Track your store performance and understand your customers</Subtitle>
          </div>
          <HeaderActions>
            <RefreshButton 
              onClick={handleRefresh} 
              disabled={loading || refreshing}
              title="Refresh analytics data"
            >
              {refreshing ? '⟳' : '↻'} {refreshing ? 'Refreshing...' : 'Refresh'}
            </RefreshButton>
          </HeaderActions>
        </Header>

        {/* Sales Overview KPI Cards */}
        {analytics.overview && (
          <Module $delay={0.1}>
            <KPICards data={analytics.overview} />
          </Module>
        )}

        {/* Sales Heatmap */}
        {analytics.heatmap && (
          <Module $delay={0.2}>
            <SalesHeatmap 
              data={analytics.heatmap}
              sellerId={sellerId}
            />
          </Module>
        )}

        {/* Time-Series Chart */}
        {analytics.timeSeries && (
          <Module $delay={0.3}>
            <TimeSeriesChart 
              data={analytics.timeSeries}
              sellerId={sellerId}
            />
          </Module>
        )}

        {/* Product Performance */}
        {analytics.productPerformance && (
          <Module $delay={0.4}>
            <ProductPerformance 
              data={analytics.productPerformance}
              sellerId={sellerId}
            />
          </Module>
        )}

        {/* Customer Demographics */}
        {analytics.demographics && (
          <Module $delay={0.5}>
            <CustomerDemographics 
              data={analytics.demographics}
              sellerId={sellerId}
            />
          </Module>
        )}

        {/* Show message if no data at all */}
        {!analytics.overview && !analytics.heatmap && !analytics.timeSeries && !analytics.productPerformance && !analytics.demographics && !loading && (
          <Module>
            <ErrorMessage>
              No analytics data available. Make sure you have completed orders.
            </ErrorMessage>
          </Module>
        )}
      </Content>
      
      <BottomNavigation currentPath="/seller/analytics" />
    </Container>
  );
};

