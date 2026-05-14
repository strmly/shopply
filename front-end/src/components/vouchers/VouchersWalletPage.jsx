import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { VoucherCard } from './VoucherCard.jsx';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #ffffff 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.94)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 28px 28px;
  padding: clamp(20px, 5vw, 34px) min(5vw, 48px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  max-width: 920px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(32px, 7vw, 52px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
  flex: 1;
`;

const Content = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 0;
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
  border-radius: 999px;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = ['active', 'used', 'expired', 'all'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'active';
  const [activeTab, setActiveTab] = useState(requestedTab);
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
          <BackButton onClick={() => navigate(-1)}>&lt;</BackButton>
          <Title>Vouchers</Title>
        </HeaderContent>
      </Header>

      <Content>
        <Tabs>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
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

