import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: 600;
  font-size: 16px;
`;

const RecentSearchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const RecentSearchItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.surface};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  animation: ${fadeIn} 0.3s ease-in;
  animation-fill-mode: both;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(4px);
  }

  &:nth-child(1) { animation-delay: 0.04s; }
  &:nth-child(2) { animation-delay: 0.08s; }
  &:nth-child(3) { animation-delay: 0.12s; }
  &:nth-child(4) { animation-delay: 0.16s; }
  &:nth-child(5) { animation-delay: 0.20s; }
`;

const RecentSearchContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
`;

const ClockIcon = styled.span`
  font-size: 16px;
  opacity: 0.6;
`;

const RecentSearchText = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const Badge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-size: 10px;
  font-weight: 600;
  margin-left: ${props => props.theme.spacing.xs};
`;

const RemoveButton = styled.span`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  font-size: 18px;
  transition: ${props => props.theme.transitions.swift};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.dangerBase};
  }
`;

const TrendingChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const TrendingChip = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  font-weight: 500;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.02);
  }
`;

const TrendingIcon = styled.span`
  font-size: 14px;
`;

const TrendingText = styled.span`
  color: ${props => props.theme.colors.text.primary};
`;

const TrendingCount = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const RepeatPurchasesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const SmartShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.sm};
`;

const ShortcutChip = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.primary};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text.inverse};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const QuickCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const CategoryChip = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const CategoryIcon = styled.div`
  font-size: 24px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CategoryLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  text-align: center;
  font-size: 12px;
`;

const QUICK_CATEGORIES = [
  { icon: '🛒', label: 'Groceries' },
  { icon: '🏠', label: 'Home & Kitchen' },
  { icon: '🍗', label: 'Braai' },
  { icon: '🥬', label: 'Fruits & Veg' },
  { icon: '👶', label: 'Baby & Kids' },
  { icon: '📱', label: 'Electronics' },
  { icon: '💊', label: 'Health' },
  { icon: '👕', label: 'Fashion' },
];

export const SearchIdleState = ({
  recentSearches,
  trendingSearches,
  repeatPurchases = [],
  smartShortcuts = [],
  location,
  onRecentSearchClick,
  onTrendingSearchClick,
  onRemoveRecentSearch,
  onRepeatPurchaseClick,
  onShortcutClick,
  onCategoryClick,
}) => {
  return (
    <Container>
      {recentSearches.length > 0 && (
        <Section>
          <SectionTitle>Recent Searches</SectionTitle>
          <RecentSearchesList>
            {recentSearches.map((search, index) => (
              <RecentSearchItem
                key={index}
                onClick={() => onRecentSearchClick(search)}
              >
                <RecentSearchContent>
                  <ClockIcon>🕐</ClockIcon>
                  <RecentSearchText>{search}</RecentSearchText>
                  <Badge>Bought last week</Badge>
                </RecentSearchContent>
                <RemoveButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecentSearch(search);
                  }}
                >
                  ×
                </RemoveButton>
              </RecentSearchItem>
            ))}
          </RecentSearchesList>
        </Section>
      )}

      {trendingSearches.length > 0 && (
        <Section>
          <SectionTitle>🔥 Trending Near You</SectionTitle>
          <TrendingChips>
            {trendingSearches.map((trend, index) => (
              <TrendingChip
                key={index}
                onClick={() => onTrendingSearchClick(trend.query)}
              >
                <TrendingIcon>🔥</TrendingIcon>
                <TrendingText>{trend.query}</TrendingText>
                {trend.count && trend.today && (
                  <TrendingCount>+{trend.count} today in {location?.suburb || 'your area'}</TrendingCount>
                )}
              </TrendingChip>
            ))}
          </TrendingChips>
        </Section>
      )}

      {repeatPurchases.length > 0 && (
        <Section>
          <SectionTitle>🔄 Repeat Purchases</SectionTitle>
          <RepeatPurchasesGrid>
            {repeatPurchases.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                onClick={() => onRepeatPurchaseClick && onRepeatPurchaseClick(product)}
              />
            ))}
          </RepeatPurchasesGrid>
        </Section>
      )}

      {smartShortcuts.length > 0 && (
        <Section>
          <SectionTitle>⚡ Smart Shortcuts</SectionTitle>
          <SmartShortcutsGrid>
            {smartShortcuts.map((shortcut, index) => (
              <ShortcutChip
                key={index}
                onClick={() => onShortcutClick && onShortcutClick(shortcut)}
              >
                <span>{shortcut.icon}</span>
                <span>{shortcut.label}</span>
              </ShortcutChip>
            ))}
          </SmartShortcutsGrid>
        </Section>
      )}

      <Section>
        <SectionTitle>Quick Categories</SectionTitle>
        <QuickCategoriesGrid>
          {QUICK_CATEGORIES.map((category, index) => (
            <CategoryChip
              key={index}
              onClick={() => onCategoryClick && onCategoryClick(category)}
            >
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryLabel>{category.label}</CategoryLabel>
            </CategoryChip>
          ))}
        </QuickCategoriesGrid>
      </Section>
    </Container>
  );
};
