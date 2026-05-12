import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import Input from '../ui/Input';

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
  gap: ${props => props.theme.spacing.lg};
`;

const SectionLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const CategoryCard = styled.button`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.lg};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
    transform: translateY(-1px);
  }
`;

const CategoryTitle = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const CategoryDescription = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const EmptyState = styled.div`
  border-radius: ${props => props.theme.radii.lg};
  border: 1px dashed ${props => props.theme.colors.border.default};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
  justify-content: center;
`;

const EmptyTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyButton = styled.button`
  margin-top: ${props => props.theme.spacing.sm};
  padding: 8px 16px;
  border-radius: ${props => props.theme.radii.pill};
  border: none;
  background: ${props => props.theme.colors.gradient.primary};
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

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ResultItem = styled.button`
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: transparent;
  text-align: left;
  cursor: pointer;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultTitle = styled.span`
  font-weight: 500;
`;

const ResultCategory = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

export const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/help/categories`);
        const json = await res.json();
        if (json.success) {
          setCategories(json.data || []);
        }
      } catch (e) {
        console.error('Error loading help categories', e);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/help/search?q=${encodeURIComponent(trimmed)}`
        );
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (e) {
        console.error('Error searching help articles', e);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleCategoryPress = (categoryId) => {
    navigate(`/support/help/category/${categoryId}`);
  };

  const handleArticlePress = (articleId) => {
    navigate(`/support/help/article/${articleId}`);
  };

  const handleContactPress = () => {
    navigate('/support/contact');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">
          ←
        </BackButton>
        <Title>Help Center</Title>
      </Header>

      <Content>
        <Input
          placeholder="Search for help…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {query.trim() && results.length > 0 && (
          <SearchResults>
            {results.map(article => (
              <ResultItem
                key={article.id}
                type="button"
                onClick={() => handleArticlePress(article.id)}
              >
                <ResultTitle>{article.title}</ResultTitle>
                <ResultCategory>Article</ResultCategory>
              </ResultItem>
            ))}
          </SearchResults>
        )}

        <div>
          <SectionLabel>Browse by topic</SectionLabel>
          <CategoriesGrid>
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                type="button"
                onClick={() => handleCategoryPress(category.id)}
              >
                <CategoryTitle>{category.title}</CategoryTitle>
                <CategoryDescription>{category.description}</CategoryDescription>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </div>

        {!query.trim() && (
          <EmptyState>
            <EmptyTitle>Can’t find what you’re looking for?</EmptyTitle>
            <div>Our team is here to help.</div>
            <EmptyButton type="button" onClick={handleContactPress}>
              Contact Support
            </EmptyButton>
          </EmptyState>
        )}
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


