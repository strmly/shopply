import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  padding: 0 ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const CategoryItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: transparent;
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  padding: ${props => props.theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  width: ${props => props.theme.spacing.xxl * 1.25};
  height: ${props => props.theme.spacing.xxl * 1.25};
  border-radius: ${props => props.theme.radii.circle};
  background: ${props => props.$color || props.theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xs};
  box-shadow: ${props => props.theme.shadows.xs};
  transition: ${props => props.theme.transitions.swift};

  ${CategoryItem}:hover & {
    box-shadow: ${props => props.theme.shadows.md};
    transform: scale(1.05);
  }
`;

const CategoryLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  text-align: center;
`;

// Furniture Rooms/Categories - Matches backend furnitureTaxonomy.js
// Colors mapped to theme tokens for consistency with design system
const getCategoryColors = (theme) => [
  { icon: '🛋️', label: 'Living', room: 'living', color: theme.colors.primarySoftBg },
  { icon: '🛏️', label: 'Bedroom', room: 'bedroom', color: theme.colors.secondarySoftBg },
  { icon: '🍽️', label: 'Dining', room: 'dining', color: theme.colors.success[100] },
  { icon: '💼', label: 'Office', room: 'office', color: theme.colors.danger[100] },
  { icon: '🌳', label: 'Outdoor', room: 'outdoor', color: theme.colors.warning[100] },
  { icon: '🧸', label: 'Kids', room: 'kids', color: theme.colors.info[100] },
  { icon: '📦', label: 'Storage', room: 'storage', color: theme.colors.danger[100] },
  { icon: '🪑', label: 'All Furniture', room: 'all', color: theme.colors.success[100] },
];

export const CategoryGrid = ({ onCategoryClick }) => {
  const theme = useTheme();
  const categories = getCategoryColors(theme);

  return (
    <Container>
      <Grid>
        {categories.map((category, index) => (
          <CategoryItem
            key={index}
            onClick={() => onCategoryClick && onCategoryClick(category)}
          >
            <CategoryIcon $color={category.color}>
              {category.icon}
            </CategoryIcon>
            <CategoryLabel>{category.label}</CategoryLabel>
          </CategoryItem>
        ))}
      </Grid>
    </Container>
  );
};











