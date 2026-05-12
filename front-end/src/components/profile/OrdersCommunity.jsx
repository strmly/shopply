import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  animation: ${fadeIn} 0.3s ease-in;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.06);
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 24px;
  line-height: 1.1;
  margin: 0 0 16px;
`;

const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 16px;
  margin: 0 0 10px;
`;

const List = styled.div`
  display: grid;
  gap: 8px;
`;

const Card = styled.button`
  padding: 14px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: rgba(61, 129, 239, 0.28);
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(3px);
  }
`;

const Left = styled.div`
  display: grid;
  gap: 4px;
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const Value = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 18px;
  margin-bottom: 10px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 22px;
`;

const StatLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  margin-top: 4px;
`;

const EmptyText = styled.div`
  padding: 16px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 700;
`;

export const OrdersCommunity = ({ orders, reviews, communityActivity, navigate }) => {
  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

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
                    R{parseFloat(order.totals?.total || 0).toFixed(2)} - {order.status}
                  </Value>
                </Left>
                <Arrow>&gt;</Arrow>
              </Card>
            ))
          ) : (
            <EmptyText>No orders yet</EmptyText>
          )}
          {orders && orders.length > 3 && (
            <Card onClick={() => navigate('/orders')}>
              <Left>
                <Label>View All Orders</Label>
              </Left>
              <Arrow>&gt;</Arrow>
            </Card>
          )}
        </List>
      </Section>

      <Section>
        <SectionTitle>Reviews & Ratings</SectionTitle>
        {reviews && reviews.length > 0 && (
          <Stats>
            <StatItem>
              <StatValue>{averageRating}</StatValue>
              <StatLabel>Avg Rating</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{reviews.length}</StatValue>
              <StatLabel>Reviews</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{communityActivity?.answers || 0}</StatValue>
              <StatLabel>Answers</StatLabel>
            </StatItem>
          </Stats>
        )}
        <Card onClick={() => navigate('/reviews')}>
          <Left>
            <Label>My Reviews</Label>
            <Value>{reviews?.length || 0} reviews written</Value>
          </Left>
          <Arrow>&gt;</Arrow>
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
          <Arrow>&gt;</Arrow>
        </Card>
      </Section>
    </Container>
  );
};
