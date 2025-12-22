import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  animation: ${shimmer} 2s infinite;
  background: linear-gradient(
    to right,
    ${props => props.theme.colors.surface} 0%,
    ${props => props.theme.colors.neutral[50]} 50%,
    ${props => props.theme.colors.surface} 100%
  );
  background-size: 1000px 100%;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
`;

const SkeletonBox = styled.div`
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.radii.sm};
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
`;

export const PaymentMethodCardSkeleton = () => {
  return (
    <Card>
      <TopRow>
        <CardInfo>
          <SkeletonBox width="48px" height="32px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonBox width="60%" height="16px" />
            <SkeletonBox width="40%" height="14px" />
          </div>
        </CardInfo>
        <SkeletonBox width="24px" height="24px" />
      </TopRow>
      <SkeletonBox width="80px" height="20px" />
    </Card>
  );
};

