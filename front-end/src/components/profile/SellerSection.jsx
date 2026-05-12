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
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.18), rgba(196, 184, 252, 0.14), rgba(255,255,255,0.8)) border-box;
  border-radius: 28px;
  padding: 22px;
  border: 1px solid transparent;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease-in;
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
  font-weight: 900;
  font-size: 24px;
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
  color: ${props => props.theme.colors.text.inverse};
  background: ${props => props.theme.colors.text.primary};
  border: none;
  font-weight: 900;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 999px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
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
          View dashboard
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



