import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  position: relative;
  overflow: hidden;
  
  ${props => props.$actionRequired && `
    border-color: ${props.theme.colors.danger[300]};
    background: linear-gradient(135deg, ${props.theme.colors.danger[100]} 0%, ${props.theme.colors.warning[100]} 100%);
    box-shadow: 0 4px 12px rgba(198, 40, 80, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: ${props.theme.colors.danger[500]};
    }
  `}
  
  ${props => props.$status === 'processing' && `
    border-color: ${props.theme.colors.info[300]};
  `}
  
  ${props => props.$status === 'completed' && `
    border-color: ${props.theme.colors.success[300]};
    background: linear-gradient(135deg, ${props.theme.colors.success[50]} 0%, ${props.theme.colors.surface} 100%);
  `}
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CardContent = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const ProductImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  border: 2px solid ${props => props.theme.colors.border.light};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  ${Card}:hover & img {
    transform: scale(1.05);
  }
`;

const Content = styled.div`
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
  line-height: 1.4;
`;

const Reason = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const RefundAmount = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 700;
  color: ${props => props.theme.colors.success[600]};
  font-size: 16px;
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  
  &::before {
    content: '💰';
    font-size: 18px;
  }
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

const StatusBadge = styled.div`
  padding: 6px 14px;
  border-radius: ${props => props.theme.radii.pill};
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[100];
    if (props.$status === 'action_required') return props.theme.colors.danger[100];
    if (props.$status === 'processing' || props.$status === 'refund_processing') return props.theme.colors.info[100];
    return props.theme.colors.warning[100];
  }};
  color: ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[600];
    if (props.$status === 'action_required') return props.theme.colors.danger[600];
    if (props.$status === 'processing' || props.$status === 'refund_processing') return props.theme.colors.info[600];
    return props.theme.colors.warning[600];
  }};
  border: 1px solid ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[300];
    if (props.$status === 'action_required') return props.theme.colors.danger[300];
    if (props.$status === 'processing' || props.$status === 'refund_processing') return props.theme.colors.info[300];
    return props.theme.colors.warning[300];
  }};
  
  ${props => props.$status === 'processing' && `
    animation: ${pulse} 2s infinite;
  `}
  
  &::before {
    content: ${props => {
      if (props.$status === 'completed') return '"✓"';
      if (props.$status === 'action_required') return '"⚠"';
      if (props.$status === 'processing') return '"⟳"';
      return '"⏳"';
    }};
    font-size: 14px;
  }
`;

const ExpectedDate = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  text-align: right;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.xs};
  box-shadow: 0 2px 4px rgba(61, 129, 239, 0.2);
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    box-shadow: 0 4px 8px rgba(61, 129, 239, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 2px rgba(61, 129, 239, 0.2);
  }
`;

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

const formatCurrency = (amount) => {
  return `R${amount.toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: ${props => props.theme.colors.neutral[100]};
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: ${props => {
      if (props.$status === 'completed') return props.theme.colors.success[500];
      if (props.$status === 'processing') return props.theme.colors.info[500];
      return props.theme.colors.primary;
    }};
    transition: width 0.5s ease;
    animation: ${props => props.$status === 'processing' ? pulse : 'none'} 2s infinite;
  }
`;

const getProgress = (status) => {
  const progressMap = {
    pending: 10,
    approved: 30,
    processing: 50,
    item_received: 70,
    refund_processing: 85,
    completed: 100,
  };
  return progressMap[status] || 0;
};

export const ReturnStatusCard = ({ returnItem, onClick, style }) => {
  const statusLabel = getStatusLabel(returnItem.status, returnItem.actionRequired);
  const statusType = getStatusType(returnItem.status, returnItem.actionRequired);
  const expectedDate = returnItem.expectedRefundDate 
    ? formatDate(returnItem.expectedRefundDate)
    : null;
  const progress = getProgress(returnItem.status);

  const getReasonLabel = () => {
    const labels = {
      damaged: 'Damaged item',
      wrong_item: 'Wrong item delivered',
      defective: 'Defective item',
      not_as_described: 'Not as described',
      changed_mind: 'Changed mind',
      other: 'Other',
    };
    return labels[returnItem.reason] || returnItem.reason;
  };

  return (
    <Card 
      onClick={onClick}
      $actionRequired={returnItem.actionRequired}
      $status={statusType}
      style={style}
    >
      <CardContent>
        <ProductImage>
          {returnItem.productImage ? (
            <img src={returnItem.productImage} alt={returnItem.productName} />
          ) : (
            '📦'
          )}
        </ProductImage>
        <Content>
          <ProductName>{returnItem.productName}</ProductName>
          <Reason>{getReasonLabel()}</Reason>
          <RefundAmount>
            Refund: {formatCurrency(returnItem.refundAmount || 0)}
          </RefundAmount>
        </Content>
        <RightSection>
          <StatusBadge $status={statusType}>
            {statusLabel}
          </StatusBadge>
          {expectedDate && (
            <ExpectedDate>
              Expected by: {expectedDate}
            </ExpectedDate>
          )}
          {returnItem.actionRequired && returnItem.actionRequiredMessage && (
            <ActionButton onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}>
              {returnItem.actionRequiredMessage.includes('Complete') 
                ? 'Complete return' 
                : 'Take action'}
            </ActionButton>
          )}
        </RightSection>
      </CardContent>
      {returnItem.status !== 'completed' && returnItem.status !== 'cancelled' && returnItem.status !== 'rejected' && (
        <ProgressBar $progress={progress} $status={statusType} />
      )}
    </Card>
  );
};

