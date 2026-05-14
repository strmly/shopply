import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

// Core shimmer mixin — used by all skeleton variants
const shimmerStyle = css`
  background: linear-gradient(
    105deg,
    #eef2f7 0%,
    #eef2f7 30%,
    rgba(255, 255, 255, 0.88) 50%,
    #eef2f7 70%,
    #eef2f7 100%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

export const Skeleton = styled.div`
  ${shimmerStyle}
  border-radius: ${props => props.$circle ? '50%' : props.$radius || props.theme.radii.md};
  ${props => props.$width  && `width:  ${props.$width};`}
  ${props => props.$height && `height: ${props.$height};`}
  flex-shrink: 0;
`;

export const SkeletonText = styled(Skeleton)`
  height: ${props =>
    props.$size === 'title'  ? '28px' :
    props.$size === 'large'  ? '20px' :
    props.$size === 'small'  ? '12px' :
                               '15px'};
  width: ${props => {
    if (props.$width) return props.$width;
    if (props.$size === 'title')  return '55%';
    if (props.$size === 'large')  return '65%';
    if (props.$size === 'small')  return '38%';
    return '80%';
  }};
  border-radius: 8px;
`;

export const SkeletonCard = styled.div`
  background: #ffffff;
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid rgba(228, 231, 236, 0.7);
  box-shadow: 0 2px 12px rgba(16, 24, 40, 0.04);
  overflow: hidden;
`;

export const SkeletonButton = styled(Skeleton)`
  height: 44px;
  width: 100%;
  border-radius: ${props => props.theme.radii.md};
`;

// Product card skeleton — matches the shape of ProductCard
export const ProductCardSkeleton = () => (
  <SkeletonCard style={{ display: 'flex', flexDirection: 'column' }}>
    <Skeleton $height="180px" $radius="0" />
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SkeletonText $size="small" $width="45%" />
      <SkeletonText $width="85%" />
      <SkeletonText $size="small" $width="60%" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <SkeletonText $size="large" $width="38%" />
        <Skeleton $width="36px" $height="36px" $circle />
      </div>
    </div>
  </SkeletonCard>
);

// Grid of product card skeletons
export const ProductGridSkeleton = ({ count = 6 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Cart item skeleton
export const CartItemSkeleton = () => (
  <SkeletonCard style={{ display: 'flex', gap: '12px', padding: '14px', alignItems: 'center' }}>
    <Skeleton $width="72px" $height="72px" $radius="12px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SkeletonText $width="70%" />
      <SkeletonText $size="small" $width="45%" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonText $size="large" $width="30%" />
        <Skeleton $width="88px" $height="32px" $radius="999px" />
      </div>
    </div>
  </SkeletonCard>
);

// Product detail skeleton
export const ProductDetailSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
    {/* Image gallery */}
    <Skeleton $height="340px" $radius="0" />
    {/* Content */}
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SkeletonText $size="small" $width="35%" />
      <SkeletonText $size="title" $width="78%" />
      <SkeletonText $size="title" $width="52%" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Skeleton $width="80px" $height="24px" $radius="999px" />
        <Skeleton $width="100px" $height="24px" $radius="999px" />
      </div>
      <SkeletonText $width="100%" />
      <SkeletonText $width="90%" />
      <SkeletonText $width="65%" />
    </div>
  </div>
);
