import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { VoucherCard } from './VoucherCard.jsx';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const CollapsedButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px dashed ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ExpandedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
`;

const AppliedVoucher = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.successSoftBg} 0%, ${props => props.theme.colors.success[100]} 100%);
  border: 2px solid ${props => props.theme.colors.successBase};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: 0 2px 8px ${props => props.theme.colors.success[200]};
  animation: ${fadeIn} 0.3s ease-in;
`;

const VoucherInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  flex: 1;
`;

const VoucherTitle = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  font-size: 14px;
`;

const VoucherDiscount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-size: 12px;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.successBase};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 13px;

  &:hover {
    opacity: 0.8;
  }
`;

const VouchersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text.inverse};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  
  &::before {
    content: '🎁';
    display: block;
    font-size: 48px;
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border.light};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.dangerSoftBg};
  border: 1px solid ${props => props.theme.colors.dangerBase};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  font-size: 13px;
  margin-top: ${props => props.theme.spacing.sm};
`;

import API_BASE_URL from '@config/api';

export const VoucherSelector = ({ 
  selectedVoucherId, 
  onVoucherSelect, 
  onVoucherRemove,
  cartTotal,
  userId = 'default'
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (selectedVoucherId) {
      loadAppliedVoucher();
    }
  }, [selectedVoucherId]);

  useEffect(() => {
    if (expanded && vouchers.length === 0 && !loading) {
      loadVouchers();
    }
  }, [expanded]);

  // Load eligible vouchers when cart total changes
  useEffect(() => {
    if (expanded && cartTotal > 0) {
      loadVouchers();
    }
  }, [cartTotal]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      // Include cartTotal to get only eligible vouchers sorted by discount
      const url = cartTotal > 0
        ? `${API_BASE_URL}/vouchers/active?userId=${userId}&cartTotal=${cartTotal}`
        : `${API_BASE_URL}/vouchers/active?userId=${userId}`;
      
      const response = await fetch(url);
      
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

  const loadAppliedVoucher = async () => {
    if (!selectedVoucherId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${selectedVoucherId}?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppliedVoucher(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading applied voucher:', error);
    }
  };

  const handleVoucherClick = async (voucher) => {
    if (!cartTotal || cartTotal <= 0) {
      setError('Add items to your cart first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setApplying(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          voucherId: voucher.id,
          cartTotal,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAppliedVoucher(voucher);
        onVoucherSelect && onVoucherSelect(voucher.id, data.data.discount);
        setExpanded(false);
        setError('');
      } else {
        setError(data.message || 'Failed to apply voucher');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      setError('Failed to apply voucher. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    setAppliedVoucher(null);
    onVoucherRemove && onVoucherRemove();
  };

  if (appliedVoucher) {
    const discount = appliedVoucher.type === 'percentage'
      ? (cartTotal * appliedVoucher.value / 100)
      : appliedVoucher.value;

    return (
      <Container>
        <AppliedVoucher>
          <VoucherInfo>
            <VoucherTitle>✓ {appliedVoucher.title}</VoucherTitle>
            <VoucherDiscount>
              -R{discount.toFixed(2)} discount applied
            </VoucherDiscount>
          </VoucherInfo>
          <RemoveButton onClick={handleRemove}>Remove</RemoveButton>
        </AppliedVoucher>
      </Container>
    );
  }

  if (!expanded) {
    return (
      <Container>
        <CollapsedButton onClick={() => setExpanded(true)}>
          <span>🎁</span>
          <span>Apply Voucher</span>
        </CollapsedButton>
      </Container>
    );
  }

  return (
    <Container>
      <ExpandedContainer>
        {loading ? (
          <LoadingContainer>
            <Spinner />
            <div>Loading vouchers...</div>
          </LoadingContainer>
        ) : vouchers.length === 0 ? (
          <EmptyState>
            No active vouchers available
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Keep shopping to earn rewards!
            </div>
          </EmptyState>
        ) : (
          <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <VouchersList>
              {vouchers.slice(0, 3).map(voucher => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onClick={() => !applying && handleVoucherClick(voucher)}
                  showHint={false}
                />
              ))}
            </VouchersList>
            {vouchers.length > 3 && (
              <ViewAllButton onClick={() => navigate('/vouchers')}>
                View All {vouchers.length} Vouchers →
              </ViewAllButton>
            )}
          </>
        )}
      </ExpandedContainer>
    </Container>
  );
};

