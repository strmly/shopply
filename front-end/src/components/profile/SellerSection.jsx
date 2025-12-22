import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { RevenueCard } from '../seller/dashboard/RevenueCard';
import { PendingOrdersWidget } from '../seller/dashboard/PendingOrdersWidget';
import { LowStockAlerts } from '../seller/dashboard/LowStockAlerts';
import { MessagesWidget } from '../seller/dashboard/MessagesWidget';
import { QuickActions as SellerQuickActions } from '../seller/dashboard/QuickActions';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin: ${props => props.theme.spacing.xs} 0 0 0;
`;

const ViewAllButton = styled.button`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.primary};
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

import API_BASE_URL from '@config/api';

export const SellerSection = ({ navigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
  });

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch actual seller data from API
      // For now, use mock data
      setStats({
        revenue: 12500.50,
        orders: 24,
        products: 12,
      });
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDashboard = () => {
    navigate('/seller/dashboard');
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Seller Dashboard</Title>
          <Subtitle>Manage your store and track performance</Subtitle>
        </div>
        <ViewAllButton onClick={handleViewDashboard}>
          View Full Dashboard →
        </ViewAllButton>
      </Header>
      
      <Content>
        <RevenueCard revenue={stats.revenue} />
        
        <SellerQuickActions navigate={navigate} />
        
        <PendingOrdersWidget />
        
        <LowStockAlerts />
        
        <MessagesWidget />
      </Content>
    </Container>
  );
};



