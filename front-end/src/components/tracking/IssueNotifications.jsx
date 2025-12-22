import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Card = styled.div`
  background: ${props => {
    if (props.severity === 'error') return props.theme.colors.dangerSoftBg;
    if (props.severity === 'warning') return props.theme.colors.warningSoftBg;
    return props.theme.colors.primarySoftBg;
  }};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => {
    if (props.severity === 'error') return props.theme.colors.dangerBase;
    if (props.severity === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.primary;
  }};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Icon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => {
    if (props.severity === 'error') return props.theme.colors.dangerBase;
    if (props.severity === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.primary;
  }};
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;

const Message = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => {
    if (props.severity === 'error') return props.theme.colors.dangerBase;
    if (props.severity === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const getIssueIcon = (type) => {
  const icons = {
    'delay': '⏳',
    'stock': '⚠️',
    'store_closure': '⚠️',
    'courier_swap': '🔁',
  };
  return icons[type] || '⚠️';
};

export const IssueNotifications = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <Container>
      {issues.map((issue, index) => (
        <Card key={issue.id || index} severity={issue.severity || 'warning'}>
          <Header>
            <Icon>{getIssueIcon(issue.type)}</Icon>
            <Content>
              <Title severity={issue.severity || 'warning'}>{issue.title}</Title>
              <Message>{issue.message}</Message>
              {issue.action && (
                <ActionButton 
                  severity={issue.severity || 'warning'}
                  onClick={() => {
                    if (issue.action === 'review_replacement') {
                      alert('Review replacement feature coming soon');
                    } else {
                      console.log('Action:', issue.action);
                    }
                  }}
                >
                  {issue.action === 'review_replacement' ? 'Review Replacement' : 'View Details'}
                </ActionButton>
              )}
            </Content>
          </Header>
        </Card>
      ))}
    </Container>
  );
};











