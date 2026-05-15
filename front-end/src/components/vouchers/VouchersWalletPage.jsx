import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { VoucherCard } from './VoucherCard.jsx';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 104px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
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
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 3px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 7vw, 52px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 620px) {
    grid-template-columns: repeat(3, minmax(92px, 1fr));
    overflow-x: auto;
  }
`;

const Stat = styled.div`
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228,231,236,0.92);
  border-radius: 18px;
  padding: 13px;
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
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(228,231,236,0.95)'};
  border-radius: 999px;
  background: ${props => props.$active ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.secondary};
  padding: 11px 15px;
  min-height: 42px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
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
`;

const List = styled.div`
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
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.16)) border-box;
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
`;

const StateTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(22px, 5vw, 32px);
  line-height: 1;
  font-weight: 900;
`;

const StateText = styled.p`
  max-width: 380px;
  margin: 10px auto 0;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
  line-height: 1.45;
`;

const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'used', label: 'Used' },
  { id: 'expired', label: 'Expired' },
  { id: 'all', label: 'All' },
];

export const VouchersWalletPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = tabs.some(tab => tab.id === searchParams.get('tab')) ? searchParams.get('tab') : 'active';
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [vouchers, setVouchers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = 'default';

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [voucherRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vouchers?userId=${userId}`),
        fetch(`${API_BASE_URL}/vouchers/summary?userId=${userId}`),
      ]);
      const voucherData = await voucherRes.json();
      const summaryData = await summaryRes.json();
      if (!voucherRes.ok || !voucherData.success) throw new Error(voucherData.message || 'Failed to load vouchers');
      setVouchers(voucherData.data || []);
      setSummary(summaryData.success ? summaryData.data : null);
    } catch (err) {
      console.error('Error loading vouchers:', err);
      setError(err.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const counts = useMemo(() => ({
    all: vouchers.length,
    active: vouchers.filter(v => v.status === 'active').length,
    used: vouchers.filter(v => v.status === 'used').length,
    expired: vouchers.filter(v => v.status === 'expired').length,
  }), [vouchers]);

  const filtered = activeTab === 'all' ? vouchers : vouchers.filter(v => v.status === activeTab);
  const stats = [
    { label: 'Active', value: summary?.active ?? counts.active },
    { label: 'Value', value: `R${Number(summary?.totalAvailableValue || 0).toFixed(0)}` },
    { label: 'Savings', value: `R${Number(summary?.totalSavings || 0).toFixed(0)}` },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <Container>
      <Header>
        <HeaderInner>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleBlock>
              <Eyebrow>Shopply rewards</Eyebrow>
              <Title>Vouchers</Title>
            </TitleBlock>
          </HeaderTop>
          <StatsGrid>
            {stats.map(stat => (
              <Stat key={stat.label}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </Stat>
            ))}
          </StatsGrid>
          <Tabs>
            {tabs.map(tab => (
              <Tab key={tab.id} $active={activeTab === tab.id} onClick={() => handleTabChange(tab.id)}>
                {tab.label}<Count $active={activeTab === tab.id}>{counts[tab.id] || 0}</Count>
              </Tab>
            ))}
          </Tabs>
        </HeaderInner>
      </Header>

      <Content>
        {loading ? (
          <StatePanel><div><StateMark>V</StateMark><StateTitle>Loading vouchers...</StateTitle></div></StatePanel>
        ) : error ? (
          <StatePanel><div><StateMark>!</StateMark><StateTitle>Vouchers could not load</StateTitle><StateText>{error}</StateText></div></StatePanel>
        ) : filtered.length === 0 ? (
          <StatePanel><div><StateMark>V</StateMark><StateTitle>No vouchers right now</StateTitle><StateText>Keep shopping locally to earn new Shopply rewards.</StateText></div></StatePanel>
        ) : (
          <List>
            {filtered.map(voucher => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                showHint={activeTab === 'active'}
                onClick={() => voucher.status === 'active' && navigate('/cart', { state: { selectedVoucherId: voucher.id } })}
              />
            ))}
          </List>
        )}
      </Content>

      <BottomNavigation currentPath="/vouchers" />
    </Container>
  );
};
