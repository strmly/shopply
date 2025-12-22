import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  font-size: 20px;
  margin: 0;
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Paragraph = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const HelpfulRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const HelpfulLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const HelpfulButton = styled.button`
  padding: 4px 10px;
  border-radius: ${props => props.theme.radii.pill};
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props =>
    props.$active ? props.theme.colors.primarySoftBg : props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  ${props => props.theme.typography.caption}
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const HelpArticlePage = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/help/articles/${articleId}`);
        const json = await res.json();
        if (json.success) {
          setArticle(json.data);
        }
      } catch (e) {
        console.error('Error loading help article', e);
      }
    };
    loadArticle();
  }, [articleId]);

  if (!article) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Help article</Title>
        </Header>
        <Content>
          <Paragraph>Loading article…</Paragraph>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">
          ←
        </BackButton>
        <Title>{article.title}</Title>
      </Header>

      <Content>
        {(article.content || []).map((line, idx) => (
          <Paragraph key={idx}>{line}</Paragraph>
        ))}

        <HelpfulRow>
          <HelpfulLabel>Was this helpful?</HelpfulLabel>
          <HelpfulButton
            type="button"
            $active={feedback === 'up'}
            onClick={() => setFeedback('up')}
          >
            👍 Yes
          </HelpfulButton>
          <HelpfulButton
            type="button"
            $active={feedback === 'down'}
            onClick={() => setFeedback('down')}
          >
            👎 No
          </HelpfulButton>
        </HelpfulRow>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


