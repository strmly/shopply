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
  gap: ${props => props.theme.spacing.sm};
`;

const ArticleItem = styled.button`
  padding: ${props => props.theme.spacing.md} 0;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: transparent;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ArticleTitle = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const ArticleSummary = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

export const HelpCategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/help/categories/${categoryId}/articles`
        );
        const json = await res.json();
        if (json.success) {
          setArticles(json.data || []);
        }
      } catch (e) {
        console.error('Error loading help articles', e);
      }
    };
    loadArticles();
  }, [categoryId]);

  const handleArticlePress = (articleId) => {
    navigate(`/support/help/article/${articleId}`);
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">
          ←
        </BackButton>
        <Title>Help topics</Title>
      </Header>

      <Content>
        {articles.map(article => (
          <ArticleItem
            key={article.id}
            type="button"
            onClick={() => handleArticlePress(article.id)}
          >
            <ArticleTitle>{article.title}</ArticleTitle>
            {article.summary && (
              <ArticleSummary>{article.summary}</ArticleSummary>
            )}
          </ArticleItem>
        ))}
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


