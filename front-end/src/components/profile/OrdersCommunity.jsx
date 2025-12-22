import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h4`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Card = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
`;

const Value = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 14px;
`;

const Stats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
`;

const StatLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  margin-top: 4px;
`;

export const OrdersCommunity = ({ orders, reviews, communityActivity, navigate }) => {
  return (
    <Container>
      <Title>Orders & Community</Title>

      <Section>
        <SectionTitle>My Orders</SectionTitle>
        <List>
          {orders && orders.length > 0 ? (
            orders.slice(0, 3).map((order) => (
              <Card key={order.id} onClick={() => navigate(`/tracking/${order.id}`)}>
                <Left>
                  <Label>Order #{order.id.slice(-8)}</Label>
                  <Value>
                    R{parseFloat(order.totals?.total || 0).toFixed(2)} • {order.status}
                  </Value>
                </Left>
                <Arrow>→</Arrow>
              </Card>
            ))
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
              No orders yet
            </div>
          )}
          {orders && orders.length > 3 && (
            <Card onClick={() => navigate('/orders')}>
              <Left>
                <Label>View All Orders</Label>
              </Left>
              <Arrow>→</Arrow>
            </Card>
          )}
        </List>
      </Section>

      <Section>
        <SectionTitle>Reviews & Ratings</SectionTitle>
        {reviews && reviews.length > 0 && (
          <Stats>
            <StatItem>
              <StatValue>⭐ {reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length}</StatValue>
              <StatLabel>Avg Rating</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{reviews.length}</StatValue>
              <StatLabel>Reviews</StatLabel>
            </StatItem>
          </Stats>
        )}
        <Card onClick={() => navigate('/reviews')}>
          <Left>
            <Label>My Reviews</Label>
            <Value>{reviews?.length || 0} reviews written</Value>
          </Left>
          <Arrow>→</Arrow>
        </Card>
      </Section>

      <Section>
        <SectionTitle>Community Activity</SectionTitle>
        <Stats>
          <StatItem>
            <StatValue>{communityActivity?.posts || 0}</StatValue>
            <StatLabel>Posts</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{communityActivity?.questions || 0}</StatValue>
            <StatLabel>Questions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{communityActivity?.answers || 0}</StatValue>
            <StatLabel>Answers</StatLabel>
          </StatItem>
        </Stats>
        <Card onClick={() => navigate('/community')}>
          <Left>
            <Label>View Community Activity</Label>
          </Left>
          <Arrow>→</Arrow>
        </Card>
      </Section>
    </Container>
  );
};











