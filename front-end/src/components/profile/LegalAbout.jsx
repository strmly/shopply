import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  background: ${props => props.theme.colors.gradient.soft};
  border-radius: 26px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border.default};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 22px;
  line-height: 1.1;
  margin: 0 0 14px;
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateX(3px);
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
`;

const Version = styled.div`
  padding-top: 14px;
  text-align: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
`;

export const LegalAbout = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>Legal & About</Title>
      <ListItem onClick={() => navigate('/legal')}>
        <Label>View All Legal Documents</Label>
        <Arrow>&gt;</Arrow>
      </ListItem>

      <Version>
        Str3mly ShopLocal v1.0.0
      </Version>
    </Container>
  );
};
