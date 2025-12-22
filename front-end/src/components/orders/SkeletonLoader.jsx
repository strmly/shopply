import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.surface} 0%,
    ${props => props.theme.colors.background} 50%,
    ${props => props.theme.colors.surface} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${props => props.theme.radii.md};
`;

export const SkeletonCard = styled(SkeletonBase)`
  height: 140px;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.size || '48px'};
  height: ${props => props.size || '48px'};
  border-radius: ${props => props.theme.radii.circle};
`;

export const SkeletonBadge = styled(SkeletonBase)`
  height: 24px;
  width: 80px;
  border-radius: ${props => props.theme.radii.md};
`;

export const OrderCardSkeleton = () => (
  <SkeletonCard />
);

export const OrderListSkeleton = () => (
  <>
    {[1, 2, 3].map(i => (
      <OrderCardSkeleton key={i} />
    ))}
  </>
);

