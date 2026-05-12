import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';

const Container = styled.section`
  padding: 0 clamp(14px, 5vw, 48px);
  margin: 0 auto 38px;
`;

const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 6px;
`;

const Eyebrow = styled.span`
  width: fit-content;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 999px;
  padding: 7px 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(28px, 5vw, 46px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  max-width: 300px;
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryItem = styled.button`
  min-height: 156px;
  display: grid;
  align-content: space-between;
  justify-items: start;
  gap: 16px;
  background:
    linear-gradient(140deg, ${props => props.$color} 0%, rgba(255,255,255,0.86) 100%) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  padding: 18px;
  overflow: hidden;
  position: relative;
  text-align: left;
  box-shadow: 0 14px 32px rgba(16, 24, 40, 0.06);

  @media (max-width: 520px) {
    min-height: 132px;
    border-radius: 20px;
    padding: 16px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 130px;
    height: 130px;
    right: -42px;
    top: -42px;
    border-radius: 999px;
    background: rgba(255,255,255,0.54);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 24px 54px rgba(16, 24, 40, 0.13);
  }
`;

const CategoryIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(255,255,255,0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$accent};
  font-weight: 900;
  z-index: 1;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
`;

const CategoryCopy = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
`;

const CategoryLabel = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 21px;
  line-height: 1.1;
  font-weight: 900;

  @media (max-width: 520px) {
    font-size: 19px;
  }
`;

const CategoryDescription = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
`;

const getCategories = (theme) => [
  { icon: 'L', label: 'Living', description: 'Sofas and tables', room: 'living', color: theme.colors.primarySoftBg, accent: theme.colors.primary },
  { icon: 'B', label: 'Bedroom', description: 'Beds and storage', room: 'bedroom', color: theme.colors.secondarySoftBg, accent: theme.colors.secondaryActive },
  { icon: 'D', label: 'Dining', description: 'Tables and chairs', room: 'dining', color: theme.colors.success[100], accent: theme.colors.success[600] },
  { icon: 'O', label: 'Office', description: 'Desks and focus', room: 'office', color: theme.colors.info[100], accent: theme.colors.info[600] },
  { icon: 'G', label: 'Outdoor', description: 'Patio and garden', room: 'outdoor', color: theme.colors.warning[100], accent: theme.colors.warning[600] },
  { icon: 'K', label: 'Kids', description: 'Playful rooms', room: 'kids', color: '#FDF2F8', accent: '#BE185D' },
  { icon: 'S', label: 'Storage', description: 'Tidy solutions', room: 'storage', color: theme.colors.neutral[50], accent: theme.colors.neutral[600] },
  { icon: 'A', label: 'All Rooms', description: 'Every local find', room: 'all', color: '#ECFEFF', accent: '#0E7490' },
];

export const CategoryGrid = ({ onCategoryClick }) => {
  const theme = useTheme();
  const categories = getCategories(theme);

  return (
    <Container>
      <Inner>
        <Header>
          <TitleBlock>
            <Eyebrow>Shop by room</Eyebrow>
            <Title>Find the feeling first</Title>
          </TitleBlock>
          <Subtitle>Curated rooms, local availability.</Subtitle>
        </Header>
        <Grid>
          {categories.map((category) => (
            <CategoryItem
              key={category.room}
              $color={category.color}
              onClick={() => onCategoryClick && onCategoryClick(category)}
            >
              <CategoryIcon $accent={category.accent}>{category.icon}</CategoryIcon>
              <CategoryCopy>
                <CategoryLabel>{category.label}</CategoryLabel>
                <CategoryDescription>{category.description}</CategoryDescription>
              </CategoryCopy>
            </CategoryItem>
          ))}
        </Grid>
      </Inner>
    </Container>
  );
};
