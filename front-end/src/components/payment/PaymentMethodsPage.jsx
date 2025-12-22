import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodCardSkeleton } from './PaymentMethodCardSkeleton';
import { BottomNavigation } from '../home/BottomNavigation';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { BottomSheet } from '../ui/BottomSheet';
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

const SecurityBanner = styled.div`
  background: ${props => props.theme.colors.success[100]};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.success[600]};
  font-size: 13px;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
`;

const PaymentMethodList = styled.div`
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

const MenuItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  text-align: left;
  ${props => props.theme.typography.body1}
  color: ${props => props.destructive 
    ? props.theme.colors.danger[500]
    : props.theme.colors.text.primary
  };
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  border-radius: ${props => props.theme.radii.md};

  &:hover {
    background: ${props => props.destructive
      ? props.theme.colors.danger[100]
      : props.theme.colors.neutral[50]
    };
  }

  &:active {
    opacity: 0.7;
  }
`;

import API_BASE_URL from '@config/api';

export const PaymentMethodsPage = ({ location }) => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [menuSheet, setMenuSheet] = useState(null);

  const userId = 'default'; // TODO: Get from auth context

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment-methods/my-payment-methods?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data || []);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    navigate('/payment-methods/new');
  };

  const handleMenuClick = (paymentMethod) => {
    setMenuSheet(paymentMethod);
  };

  const handleSetDefault = async (paymentMethod) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payment-methods/${paymentMethod.id}/set-default`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Default payment method updated ✓');
          setMenuSheet(null);
          // Reload after a brief delay
          setTimeout(() => {
            loadPaymentMethods();
          }, 300);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to set default payment method');
    }
  };

  const handleRename = (paymentMethod) => {
    // TODO: Implement rename functionality
    const newName = prompt('Enter a nickname for this card:', paymentMethod.nickname || '');
    if (newName !== null) {
      // Update payment method with nickname
      // This would call the update API
      toast.info('Rename functionality coming soon');
    }
    setMenuSheet(null);
  };

  const handleDelete = (paymentMethod) => {
    setMenuSheet(null);
    setDeleteDialog({
      paymentMethod,
      message: 'Remove this payment method?',
      description: 'You can add it again anytime.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/payment-methods/${deleteDialog.paymentMethod.id}?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Payment method removed successfully');
        // Reload after a brief delay for smooth UX
        setTimeout(() => {
          loadPaymentMethods();
        }, 300);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to remove payment method');
    } finally {
      setDeleteDialog(null);
    }
  };


  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>Payment Methods</Title>
        </HeaderLeft>
        <AddButton onClick={handleAddPaymentMethod}>+ Add Card</AddButton>
      </Header>

      <SecurityBanner>
        🔒 Your payment information is encrypted and securely stored.
      </SecurityBanner>

      <Content>
        {loading ? (
          <PaymentMethodList>
            {[1, 2, 3].map((i) => (
              <PaymentMethodCardSkeleton key={i} />
            ))}
          </PaymentMethodList>
        ) : paymentMethods.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💳</EmptyIcon>
            <EmptyTitle>No payment methods</EmptyTitle>
            <EmptyText>
              Add a payment method for faster checkout.
              Your details are securely stored.
            </EmptyText>
            <EmptyButton onClick={handleAddPaymentMethod}>Add Payment Method</EmptyButton>
          </EmptyState>
        ) : (
          <PaymentMethodList>
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onSetDefault={handleSetDefault}
                onRename={handleRename}
                onDelete={handleDelete}
                onMenuClick={handleMenuClick}
              />
            ))}
          </PaymentMethodList>
        )}
      </Content>

      {menuSheet && (
        <BottomSheet
          isOpen={true}
          onClose={() => setMenuSheet(null)}
          title="Card Options"
        >
          {!menuSheet.isDefault && (
            <MenuItem onClick={() => handleSetDefault(menuSheet)}>
              Set as default
            </MenuItem>
          )}
          <MenuItem onClick={() => handleRename(menuSheet)}>
            Rename
          </MenuItem>
          <MenuItem 
            destructive
            onClick={() => handleDelete(menuSheet)}
          >
            Remove
          </MenuItem>
        </BottomSheet>
      )}

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

      <BottomNavigation currentPath="/payment-methods" />
    </Container>
  );
};

