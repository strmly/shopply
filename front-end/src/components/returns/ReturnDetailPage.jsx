import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TimelineStepper } from './TimelineStepper';

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

const Content = styled.div`
  padding: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 18px;
`;

const ProductInfo = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProductImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const InfoValue = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  text-align: right;
`;

const RefundAmount = styled.div`
  ${props => props.theme.typography.heading2}
  font-weight: 700;
  color: ${props => props.theme.colors.success[600]};
  font-size: 24px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  padding: 6px 16px;
  border-radius: ${props => props.theme.radii.pill};
  font-size: 14px;
  font-weight: 600;
  background: ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[100];
    if (props.$status === 'action_required') return props.theme.colors.danger[100];
    if (props.$status === 'processing') return props.theme.colors.info[100];
    return props.theme.colors.warning[100];
  }};
  color: ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[600];
    if (props.$status === 'action_required') return props.theme.colors.danger[600];
    if (props.$status === 'processing') return props.theme.colors.info[600];
    return props.theme.colors.warning[600];
  }};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.md};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger[100]};
  border: 1px solid ${props => props.theme.colors.danger[300]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.danger[600]};
  ${props => props.theme.typography.body2}
`;

const formatCurrency = (amount) => {
  return `R${amount.toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getReasonLabel = (reason) => {
  const labels = {
    damaged: 'Damaged item',
    wrong_item: 'Wrong item delivered',
    defective: 'Defective item',
    not_as_described: 'Not as described',
    changed_mind: 'Changed mind',
    other: 'Other',
  };
  return labels[reason] || reason;
};

const getStatusLabel = (status, actionRequired) => {
  if (actionRequired) {
    return 'Action required';
  }
  
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    processing: 'Processing',
    item_received: 'Item received',
    refund_processing: 'Refund processing',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  
  return labels[status] || status;
};

const getStatusType = (status, actionRequired) => {
  if (actionRequired) {
    return 'action_required';
  }
  if (status === 'completed') {
    return 'completed';
  }
  if (['processing', 'refund_processing', 'item_received'].includes(status)) {
    return 'processing';
  }
  return 'pending';
};

import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

export const ReturnDetailPage = ({ location }) => {
  const navigate = useNavigate();
  const { returnId } = useParams();
  const [returnItem, setReturnItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = getCurrentUserId();

  useEffect(() => {
    loadReturn();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadReturn(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [returnId]);

  const loadReturn = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_BASE_URL}/returns/${returnId}?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to load return: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setReturnItem(data.data);
      } else {
        throw new Error(data.message || 'Failed to load return');
      }
    } catch (error) {
      console.error('Error loading return:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReturn = async () => {
    if (!window.confirm('Are you sure you want to cancel this return?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/returns/${returnId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel return');
      }

      const data = await response.json();
      if (data.success) {
        navigate('/returns');
      }
    } catch (error) {
      console.error('Error cancelling return:', error);
      alert('Failed to cancel return. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>Return Details</Title>
          </HeaderContent>
        </Header>
        <Content>
          <LoadingState>Loading return details...</LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>Return Details</Title>
          </HeaderContent>
        </Header>
        <Content>
          <ErrorState>{error}</ErrorState>
        </Content>
      </Container>
    );
  }

  if (!returnItem) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
            <Title>Return Details</Title>
          </HeaderContent>
        </Header>
        <Content>
          <ErrorState>Return not found</ErrorState>
        </Content>
      </Container>
    );
  }

  const statusType = getStatusType(returnItem.status, returnItem.actionRequired);
  const canCancel = ['pending', 'approved'].includes(returnItem.status);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>Return Details</Title>
        </HeaderContent>
      </Header>
      <Content>
        <Section>
          <SectionTitle>Product</SectionTitle>
          <ProductInfo>
            <ProductImage>
              {returnItem.productImage ? (
                <img src={returnItem.productImage} alt={returnItem.productName} />
              ) : (
                '📦'
              )}
            </ProductImage>
            <ProductDetails>
              <ProductName>{returnItem.productName}</ProductName>
              <StoreName>{returnItem.storeName}</StoreName>
            </ProductDetails>
          </ProductInfo>
        </Section>

        <Section>
          <SectionTitle>Refund Details</SectionTitle>
          <InfoRow>
            <InfoLabel>Refund Amount</InfoLabel>
            <RefundAmount>
              {formatCurrency(returnItem.refundAmount || 0)}
            </RefundAmount>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Status</InfoLabel>
            <StatusBadge $status={statusType}>
              {getStatusLabel(returnItem.status, returnItem.actionRequired)}
            </StatusBadge>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Reason</InfoLabel>
            <InfoValue>{getReasonLabel(returnItem.reason)}</InfoValue>
          </InfoRow>
          {returnItem.reasonDescription && (
            <InfoRow>
              <InfoLabel>Description</InfoLabel>
              <InfoValue>{returnItem.reasonDescription}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel>Quantity</InfoLabel>
            <InfoValue>{returnItem.quantity}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Refund Method</InfoLabel>
            <InfoValue>
              {returnItem.refundMethod === 'wallet' ? 'Wallet' : 
               returnItem.refundMethod === 'store_credit' ? 'Store Credit' : 
               'Original Payment Method'}
            </InfoValue>
          </InfoRow>
          {returnItem.expectedRefundDate && (
            <InfoRow>
              <InfoLabel>Expected Refund Date</InfoLabel>
              <InfoValue>{formatDate(returnItem.expectedRefundDate)}</InfoValue>
            </InfoRow>
          )}
          {returnItem.refundedAt && (
            <InfoRow>
              <InfoLabel>Refunded At</InfoLabel>
              <InfoValue>{formatDate(returnItem.refundedAt)}</InfoValue>
            </InfoRow>
          )}
        </Section>

        {returnItem.timeline && returnItem.timeline.length > 0 && (
          <Section>
            <TimelineStepper returnItem={returnItem} />
          </Section>
        )}

        {returnItem.actionRequired && (
          <ActionButton onClick={() => navigate(`/returns/${returnId}`)}>
            {returnItem.actionRequiredMessage || 'Take Action'}
          </ActionButton>
        )}

        {canCancel && (
          <ActionButton 
            onClick={handleCancelReturn}
            style={{ 
              background: 'transparent', 
              color: '#C62850',
              border: '1px solid #C62850'
            }}
          >
            Cancel Return
          </ActionButton>
        )}
      </Content>
    </Container>
  );
};

