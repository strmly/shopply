import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';

import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 22px;
  margin: 0;
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const QuestionButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md} 0;
  border: none;
  background: transparent;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const QuestionText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const Chevron = styled.span`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  transform: ${props => (props.$open ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease-out;
`;

const Answer = styled.div`
  max-height: ${props => (props.$open ? '300px' : '0')};
  overflow: hidden;
  transition: max-height 0.25s ease-out;
`;

const AnswerInner = styled.div`
  padding-bottom: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const Footer = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const FooterText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const FooterButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: ${props => props.theme.radii.pill};
  border: none;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  ${props => props.theme.typography.button}
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-0.5px);
  }
`;

export const FaqPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/help/faqs`);
        const json = await res.json();
        if (json.success) {
          setFaqs(json.data || []);
        }
      } catch (e) {
        console.error('Error loading FAQs', e);
      }
    };
    loadFaqs();
  }, []);

  const toggle = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const handleContact = () => {
    navigate('/support/contact');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">
          ←
        </BackButton>
        <Title>FAQs</Title>
      </Header>

      <Content>
        {faqs.map(item => {
          const open = openId === item.id;
          return (
            <AccordionItem key={item.id}>
              <QuestionButton type="button" onClick={() => toggle(item.id)}>
                <QuestionText>{item.question}</QuestionText>
                <Chevron $open={open}>▶</Chevron>
              </QuestionButton>
              <Answer $open={open}>
                <AnswerInner>{item.answer}</AnswerInner>
              </Answer>
            </AccordionItem>
          );
        })}

        <Footer>
          <FooterText>Still need help?</FooterText>
          <FooterButton type="button" onClick={handleContact}>
            Contact Support
          </FooterButton>
        </Footer>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


