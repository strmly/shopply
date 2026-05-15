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
    ${props => props.theme.colors.neutral[50]} 0%,
    ${props => props.theme.colors.neutral[100]} 50%,
    ${props => props.theme.colors.neutral[50]} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${props => props.theme.radii.md};
`;

const Card = styled.div`
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.16), rgba(228,231,236,0.9), rgba(21,161,124,0.12)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 22px);
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSkeleton = styled(SkeletonBase)`
  height: 20px;
  width: 100px;
`;

const BadgeSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 60px;
  border-radius: ${props => props.theme.radii.pill};
`;

const Content = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const LineSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: ${props => props.$width || '100%'};
`;

const ActionsSkeleton = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ButtonSkeleton = styled(SkeletonBase)`
  flex: 1;
  height: 42px;
  border-radius: 999px;
`;

export const AddressCardSkeleton = () => {
  return (
    <Card>
      <Header>
        <TitleSkeleton />
        <BadgeSkeleton />
      </Header>
      <Content>
        <TextContent>
          <LineSkeleton $width="80%" />
          <LineSkeleton $width="60%" />
        </TextContent>
      </Content>
      <ActionsSkeleton>
        <ButtonSkeleton />
        <ButtonSkeleton />
        <ButtonSkeleton />
      </ActionsSkeleton>
    </Card>
  );
};

