import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { AddressCard } from './AddressCard';
import { AddressCardSkeleton } from './AddressCardSkeleton';
import { BottomNavigation } from '../home/BottomNavigation';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const HeaderLeft = styled.div`
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
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin: 0;
`;

const AddButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 14px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.xl};
  text-align: center;
  gap: ${props => props.theme.spacing.lg};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  margin: 0;
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  max-width: 400px;
  margin: 0;
`;

const EmptyButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const AddressManagementPage = ({ location }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [mapViewAddress, setMapViewAddress] = useState(null);

  const userId = 'default'; // TODO: Get from auth context

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Include current location for distance calculation
      const url = location
        ? `${API_BASE_URL}/addresses/my-addresses?userId=${userId}&lat=${location.lat}&lng=${location.lng}`
        : `${API_BASE_URL}/addresses/my-addresses?userId=${userId}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data || []);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    navigate('/addresses/new');
  };

  const handleEdit = (address) => {
    navigate(`/addresses/${address.id}/edit`);
  };

  const handleDelete = (address) => {
    setDeleteDialog({
      address,
      message: 'Delete this address?',
      description: 'This won\'t affect past orders.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/addresses/${deleteDialog.address.id}?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Address deleted successfully');
        loadAddresses();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setDeleteDialog(null);
    }
  };

  const handleSetDefault = async (address) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/addresses/${address.id}/set-default`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`${address.label || 'Address'} set as default`);
          loadAddresses();
        }
      } else {
        toast.error('Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const handleMapClick = (address) => {
    setMapViewAddress(address);
    navigate(`/addresses/${address.id}/map`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>My Addresses</Title>
          </HeaderLeft>
          <AddButton onClick={handleAddAddress}>+ Add Address</AddButton>
        </Header>
        <LoadingState>Loading addresses...</LoadingState>
        <BottomNavigation currentPath="/addresses" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>My Addresses</Title>
        </HeaderLeft>
        <AddButton onClick={handleAddAddress}>+ Add Address</AddButton>
      </Header>

      <Content>
        {loading ? (
          <AddressList>
            {[1, 2, 3].map((i) => (
              <AddressCardSkeleton key={i} />
            ))}
          </AddressList>
        ) : addresses.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📍</EmptyIcon>
            <EmptyTitle>No saved addresses</EmptyTitle>
            <EmptyText>
              Add an address to see local stores and delivery times.
            </EmptyText>
            <EmptyButton onClick={handleAddAddress}>Add Address</EmptyButton>
          </EmptyState>
        ) : (
          <AddressList>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                onMapClick={handleMapClick}
                currentLocation={location}
                distance={address.distance}
              />
            ))}
          </AddressList>
        )}
      </Content>

      {deleteDialog && (
        <ConfirmDialog
          isOpen={true}
          title={deleteDialog.message}
          message={deleteDialog.description}
          confirmText={deleteDialog.confirmText}
          cancelText={deleteDialog.cancelText}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog(null)}
          danger={true}
        />
      )}

      <BottomNavigation currentPath="/addresses" />
    </Container>
  );
};

