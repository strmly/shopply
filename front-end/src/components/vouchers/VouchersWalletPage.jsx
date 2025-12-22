import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { VoucherCard } from './VoucherCard.jsx';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  max-width: 600px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 700;
  flex: 1;
`;

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 2px solid ${props => props.theme.colors.border.light};
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : 'transparent'};
  border: none;
  ${props => props.theme.typography.body1}
  color: ${props => 
    props.$active 
      ? props.theme.colors.primary 
      : props.theme.colors.text.secondary};
  font-weight: ${props => props.$active ? 700 : 500};
  font-size: 14px;
  cursor: pointer;
  border-bottom: 3px solid ${props => 
    props.$active 
      ? props.theme.colors.primary 
      : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s ease;
  border-radius: ${props => props.theme.radii.md} ${props => props.theme.radii.md} 0 0;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
  }
`;

const VouchersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl * 2} ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.4s ease-in;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${props => props.theme.spacing.lg};
  animation: ${fadeIn} 0.6s ease-in;
  filter: grayscale(0.3);
`;

const EmptyTitle = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 20px;
`;

const EmptyText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const VouchersWalletPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'default';

  useEffect(() => {
    loadVouchers();
  }, [activeTab]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? null : activeTab;
      const response = await fetch(
        `${API_BASE_URL}/vouchers?userId=${userId}${status ? `&status=${status}` : ''}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVouchers(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherClick = (voucher) => {
    if (voucher.status === 'active') {
      // Navigate to checkout with voucher pre-selected
      navigate('/cart', { state: { selectedVoucherId: voucher.id } });
    }
  };

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'used', label: 'Used' },
    { id: 'expired', label: 'Expired' },
    { id: 'all', label: 'All' },
  ];

  const filteredVouchers = vouchers.filter(v => {
    if (activeTab === 'all') return true;
    return v.status === activeTab;
  });

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>Vouchers</Title>
        </HeaderContent>
      </Header>

      <Content>
        <Tabs>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </Tabs>

        {loading ? (
          <LoadingContainer>Loading vouchers...</LoadingContainer>
        ) : filteredVouchers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎁</EmptyIcon>
            <EmptyTitle>No vouchers right now</EmptyTitle>
            <EmptyText>
              Keep shopping locally to earn rewards!
            </EmptyText>
          </EmptyState>
        ) : (
          <VouchersList>
            {filteredVouchers.map(voucher => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onClick={() => handleVoucherClick(voucher)}
                showHint={activeTab === 'active'}
              />
            ))}
          </VouchersList>
        )}
      </Content>

      <BottomNavigation />
    </Container>
  );
};

