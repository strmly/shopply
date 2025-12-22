import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CategoryCard = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.selected 
    ? props.theme.colors.primarySoftBg 
    : props.theme.colors.surface};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-align: center;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 48px;
`;

const CategoryName = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const categories = [
  { id: 'grocery', name: 'Groceries', icon: '🛒' },
  { id: 'bakery', name: 'Bakery', icon: '🥖' },
  { id: 'meat', name: 'Meat & Poultry', icon: '🥩' },
  { id: 'home', name: 'Home Goods', icon: '🏠' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'liquor', name: 'Liquor', icon: '🍷' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'pets', name: 'Pets', icon: '🐾' },
  { id: 'general', name: 'General Store', icon: '🏪' },
];

export const CategorySelection = ({ onNext, onBack, data }) => {
  const [selectedCategories, setSelectedCategories] = useState(data.categories || []);

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onNext({ categories: selectedCategories });
  };

  return (
    <Container>
      <Title>Category Selection</Title>
      <Subtitle>What categories does your store sell?</Subtitle>

      <CategoryGrid>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            selected={selectedCategories.includes(category.id)}
            onClick={() => toggleCategory(category.id)}
            type="button"
          >
            <CategoryIcon>{category.icon}</CategoryIcon>
            <CategoryName>{category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoryGrid>

      <ButtonGroup>
        <Button type="button" onClick={onBack} style={{ flex: 1, background: 'transparent', border: '1px solid #ddd' }}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} style={{ flex: 1 }}>
          Continue
        </Button>
      </ButtonGroup>
    </Container>
  );
};

