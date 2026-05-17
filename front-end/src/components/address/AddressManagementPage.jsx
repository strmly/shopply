import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { AddressCard } from './AddressCard';
import { AddressCardSkeleton } from './AddressCardSkeleton';
import { BottomNavigation } from '../home/BottomNavigation';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

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

const AddButton = styled.button`
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(61, 129, 239, 0.2);

  @media (max-width: 520px) {
    padding: 11px 13px;
  }
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
  min-width: 0;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 18px;
  padding: 13px;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 800;
  margin-top: 5px;
`;

const Content = styled.main`
  width: min(1020px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 0;

  @media (max-width: 560px) {
    width: min(100% - 24px, 1020px);
  }
`;

const AddressList = styled.div`
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
  max-width: 390px;
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

export const AddressManagementPage = ({ location }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [error, setError] = useState(null);
  const userId = getCurrentUserId();

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ userId });
      if (location?.lat && location?.lng) {
        params.set('lat', location.lat);
        params.set('lng', location.lng);
      }

      const response = await fetch(`${API_BASE_URL}/addresses/my-addresses?${params.toString()}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to load addresses');
      setAddresses(data.data || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err.message || 'Failed to load addresses');
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const stats = useMemo(() => {
    const defaultAddress = addresses.find(address => address.isDefault);
    return [
      { label: 'Saved', value: addresses.length },
      { label: 'Default', value: defaultAddress?.label || 'None' },
      { label: 'Area', value: defaultAddress?.suburb || addresses[0]?.suburb || 'Nearby' },
    ];
  }, [addresses]);

  const handleDelete = (address) => {
    setDeleteDialog({
      address,
      message: `Delete ${address.label || 'address'}?`,
      description: "This won't affect past orders, but you may need another address at checkout.",
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${deleteDialog.address.id}?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || 'Failed to delete address');
      toast.success('Address deleted');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    } finally {
      setDeleteDialog(null);
    }
  };

  const handleSetDefault = async (address) => {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${address.id}/set-default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to set default address');
      toast.success(`${address.label || 'Address'} is now your default`);
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to set default address');
    }
  };

  return (
    <Container>
      <Header>
        <HeaderInner>
          <HeaderTop>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <TitleBlock>
              <Eyebrow>Shopply delivery</Eyebrow>
              <Title>My Addresses</Title>
            </TitleBlock>
            <AddButton onClick={() => navigate('/addresses/new')}>Add</AddButton>
          </HeaderTop>
          <StatsGrid>
            {stats.map(stat => (
              <Stat key={stat.label}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </Stat>
            ))}
          </StatsGrid>
        </HeaderInner>
      </Header>

      <Content>
        {loading ? (
          <AddressList>
            {[1, 2, 3].map((item) => <AddressCardSkeleton key={item} />)}
          </AddressList>
        ) : error ? (
          <StatePanel>
            <div>
              <StateMark>!</StateMark>
              <StateTitle>Addresses could not load</StateTitle>
              <StateText>{error}</StateText>
              <PrimaryButton onClick={loadAddresses}>Try again</PrimaryButton>
            </div>
          </StatePanel>
        ) : addresses.length === 0 ? (
          <StatePanel>
            <div>
              <StateMark>A</StateMark>
              <StateTitle>No saved addresses</StateTitle>
              <StateText>Add a delivery address so Shopply can show local availability and send orders to the right place.</StateText>
              <PrimaryButton onClick={() => navigate('/addresses/new')}>Add address</PrimaryButton>
            </div>
          </StatePanel>
        ) : (
          <AddressList>
            {addresses.map(address => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={(selected) => navigate(`/addresses/${selected.id}/edit`)}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                distance={address.distance}
              />
            ))}
          </AddressList>
        )}
      </Content>

      {deleteDialog && (
        <ConfirmDialog
          isOpen
          title={deleteDialog.message}
          message={deleteDialog.description}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog(null)}
          danger
        />
      )}

      <BottomNavigation currentPath="/addresses" />
    </Container>
  );
};
