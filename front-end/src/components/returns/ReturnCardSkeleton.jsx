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

const SkeletonCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const SkeletonImage = styled(SkeletonBase)`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.radii.md};
  flex-shrink: 0;
`;

const SkeletonContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.$height || '16px'};
  width: ${props => props.$width || '100%'};
`;

const SkeletonBadge = styled(SkeletonBase)`
  height: 24px;
  width: 80px;
  border-radius: ${props => props.theme.radii.pill};
  align-self: flex-end;
`;

export const ReturnCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonImage />
    <SkeletonContent>
      <SkeletonText $height="18px" $width="70%" />
      <SkeletonText $height="14px" $width="50%" />
      <SkeletonText $height="16px" $width="40%" style={{ marginTop: '8px' }} />
    </SkeletonContent>
    <SkeletonBadge />
  </SkeletonCard>
);

export const ReturnListSkeleton = () => (
  <>
    {[1, 2, 3].map(i => (
      <ReturnCardSkeleton key={i} />
    ))}
  </>
);

