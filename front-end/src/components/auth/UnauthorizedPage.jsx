import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Container = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: ${({ theme }) => theme.colors.background};
  text-align: center;
`;

const Code = styled.div`
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 32px;
  max-width: 320px;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: capitalize;
  margin-bottom: 32px;
`;

const Button = styled.button`
  padding: 14px 28px;
  border-radius: 14px;
  border: none;
  background: ${({ theme }) => theme.colors.gradient.primary};
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
`;

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <Container>
      <Code>403</Code>
      <Title>Access Denied</Title>
      <Subtitle>You don't have permission to view this page.</Subtitle>
      <RoleBadge>Your role: {role}</RoleBadge>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </Container>
  );
};

export default UnauthorizedPage;
