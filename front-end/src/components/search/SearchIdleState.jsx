import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { ProductCard } from '../home/ProductCard';

const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px min(5vw, 48px);
  animation: ${fadeIn} 0.3s ease-in;
`;

const HeroIntro = styled.section`
  margin-bottom: 28px;
  padding: 28px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 44%, rgba(241,247,255,0.82) 100%);
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const Eyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const HeroTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(30px, 6vw, 56px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
`;

const HeroCopy = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 14px 0 0;
  max-width: 620px;
  font-weight: 500;
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const FlashDealsPanel = styled.section`
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.93) 48%, rgba(254,247,227,0.92) 100%) padding-box,
    linear-gradient(140deg, rgba(245, 158, 11, 0.28), rgba(61, 129, 239, 0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 22px 50px rgba(16, 24, 40, 0.09);

  &::after {
    content: '';
    position: absolute;
    right: -34px;
    top: -42px;
    width: 132px;
    height: 132px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
    pointer-events: none;
  }

  @media (max-width: 680px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const DealIcon = styled.div`
  position: relative;
  z-index: 1;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: ${props => props.theme.colors.warning[100]};
  border: 1px solid rgba(245, 158, 11, 0.24);
  color: ${props => props.theme.colors.warning[600]};
  font-size: 26px;
  font-weight: 900;
  box-shadow: 0 16px 32px rgba(245, 158, 11, 0.15);
`;

const DealCopy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`;

const DealEyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warning[600]};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const DealTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(22px, 4vw, 32px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const DealText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0;
  font-weight: 600;
`;

const DealButton = styled.button`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 16px 30px rgba(16, 24, 40, 0.16);

  &:hover {
    background: ${props => props.theme.colors.warning[600]};
    transform: translateY(-1px);
  }

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    width: 100%;
  }
`;

const DealMeta = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
  }
`;

const DealCount = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: ${props => props.theme.colors.warning[600]};
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.05);
`;

const DealPreviewRail = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 2px 8px;
  margin: -12px 0 30px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DealPreviewCard = styled.div`
  width: clamp(210px, 72vw, 252px);
  flex: 0 0 auto;
`;

const NoDealsPanel = styled.div`
  margin: -12px 0 30px;
  padding: 18px;
  border: 1px solid rgba(228, 231, 236, 0.82);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 800;
  text-align: center;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 14px;
  font-weight: 900;
  font-size: 22px;
`;

const RecentSearchesList = styled.div`
  display: grid;
  gap: 10px;
`;

const RecentSearchItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  animation: ${fadeIn} 0.3s ease-in;
  animation-fill-mode: both;
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.05);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: rgba(61, 129, 239, 0.28);
    transform: translateX(4px);
  }
`;

const RecentSearchContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const SmallIcon = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
`;

const RecentSearchText = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const Badge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  padding: 5px 8px;
  border-radius: 999px;
  font-weight: 900;
  margin-left: ${props => props.theme.spacing.xs};
`;

const RemoveButton = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  font-size: 18px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.dangerBase};
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$strong ? props.theme.colors.gradient.soft : '#ffffff'};
  border: 1px solid ${props => props.$strong ? 'rgba(61, 129, 239, 0.28)' : props.theme.colors.border.default};
  border-radius: 999px;
  padding: 11px 14px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  color: ${props => props.$strong ? props.theme.colors.primarySoftText : props.theme.colors.text.primary};
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.05);

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const TrendingPanel = styled.section`
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
  padding: 22px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94) 55%, rgba(241,247,255,0.9)) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow: 0 22px 50px rgba(16, 24, 40, 0.08);

  &::after {
    content: '';
    position: absolute;
    right: -48px;
    bottom: -56px;
    width: 150px;
    height: 150px;
    border-radius: 999px;
    background: rgba(61, 129, 239, 0.08);
    pointer-events: none;
  }
`;

const TrendingHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const TrendingTitleBlock = styled.div`
  display: grid;
  gap: 6px;
`;

const TrendingEyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
`;

const TrendingTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const TrendingHint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.82);
  border-radius: 999px;
  padding: 8px 11px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.04);
`;

const TrendingGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const TrendCard = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 86px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  border-radius: 20px;
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 14px 30px rgba(16, 24, 40, 0.05);

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(61, 129, 239, 0.3);
    box-shadow: 0 22px 44px rgba(16, 24, 40, 0.1);
  }
`;

const TrendRank = styled.span`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 13px;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

const TrendContent = styled.span`
  display: grid;
  gap: 7px;
  min-width: 0;
`;

const TrendName = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TrendMeta = styled.span`
  ${props => props.theme.typography.caption}
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  padding: 5px 8px;
  background: rgba(248, 250, 252, 0.95);
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid rgba(228, 231, 236, 0.78);
  font-weight: 900;
`;

const RepeatPurchasesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const SmartShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const QuickCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const CategoryChip = styled.button`
  position: relative;
  overflow: hidden;
  display: grid;
  justify-items: start;
  gap: 8px;
  background:
    ${props => props.$featured
      ? 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(236,254,255,0.92)) padding-box'
      : 'linear-gradient(#ffffff, #ffffff) padding-box'},
    linear-gradient(140deg, ${props => props.$accent || 'rgba(61, 129, 239, 0.16)'}, rgba(196, 184, 252, 0.12), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 14px 30px rgba(16, 24, 40, 0.06);

  &::after {
    content: '';
    position: absolute;
    right: -28px;
    top: -34px;
    width: 88px;
    height: 88px;
    border-radius: 999px;
    background: ${props => props.$featured ? 'rgba(14, 116, 144, 0.1)' : 'rgba(61, 129, 239, 0.06)'};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 42px rgba(16, 24, 40, 0.1);
  }
`;

const CategoryIcon = styled.div`
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: ${props => props.$color || props.theme.colors.gradient.soft};
  color: ${props => props.$accent || props.theme.colors.primarySoftText};
  border: 1px solid rgba(255,255,255,0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

const CategoryText = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
`;

const CategoryLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  text-align: left;
`;

const CategoryDescription = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  text-align: left;
`;

const QUICK_CATEGORIES = [
  { icon: 'L', label: 'Living', description: 'Sofas and tables', room: 'living', color: '#E8F1FF', accent: '#3D81EF' },
  { icon: 'B', label: 'Bedroom', description: 'Beds and storage', room: 'bedroom', color: '#F3F0FE', accent: '#7C3AED' },
  { icon: 'D', label: 'Dining', description: 'Tables and chairs', room: 'dining', color: '#ECFDF3', accent: '#15803D' },
  { icon: 'O', label: 'Office', description: 'Desks and shelving', room: 'office', color: '#FFF7ED', accent: '#C2410C' },
  { icon: 'G', label: 'Outdoor', description: 'Patio and garden', room: 'outdoor', color: '#F0FDF4', accent: '#16A34A' },
  { icon: 'K', label: 'Kids', description: 'Playful essentials', room: 'kids', color: '#FEF3C7', accent: '#B45309' },
  { icon: 'S', label: 'Storage', description: 'Organized living', room: 'storage', color: '#EEF2FF', accent: '#4F46E5' },
  { icon: 'A', label: 'All Rooms', description: 'Every local find', room: 'all', color: '#ECFEFF', accent: '#0E7490', featured: true },
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
  flashDeals = [],
  flashDealsLoading = false,
  onFlashDealClick,
  onFlashDealAddToCart,
}) => {
  const flashDealCount = flashDeals.length;

  return (
    <Container>
      <HeroIntro>
        <Eyebrow>Search in {location?.suburb || 'your area'}</Eyebrow>
        <HeroTitle>Find the right piece, faster.</HeroTitle>
        <HeroCopy>
          Search nearby stock, trusted stores, repeat buys, and fast local delivery in one polished flow.
        </HeroCopy>
      </HeroIntro>

      <FlashDealsPanel>
        <DealIcon>%</DealIcon>
        <DealCopy>
          <DealEyebrow>Limited time only</DealEyebrow>
          <DealTitle>Flash Deals</DealTitle>
          <DealText>
            {flashDealsLoading
              ? 'Checking live limited-time offers from nearby stores.'
              : flashDealCount > 0
                ? 'Live markdowns from the server, sorted for fast decisions.'
                : 'No live flash deals right now. Check back soon for limited-time finds.'}
          </DealText>
        </DealCopy>
        <DealMeta>
          <DealCount>
            {flashDealsLoading
              ? 'Loading deals'
              : `${flashDealCount} ${flashDealCount === 1 ? 'deal' : 'deals'} available now`}
          </DealCount>
          <DealButton
            type="button"
            onClick={() => onShortcutClick && onShortcutClick({
              label: 'Flash Deals',
              query: 'deals',
              filter: { isFlashDeal: true, onSale: true },
              icon: '%',
            })}
          >
            Browse deals
          </DealButton>
        </DealMeta>
      </FlashDealsPanel>

      {flashDealCount > 0 ? (
        <DealPreviewRail aria-label="Live flash deals from server">
          {flashDeals.slice(0, 6).map((product, index) => (
            <DealPreviewCard key={product.id || index}>
              <ProductCard
                product={{
                  ...product,
                  originalPrice: product.price,
                  price: product.flashDealPrice ?? product.discountPrice ?? product.price,
                }}
                variant="flash"
                onClick={() => onFlashDealClick && onFlashDealClick(product)}
                onAddToCart={() => onFlashDealAddToCart && onFlashDealAddToCart(product)}
              />
            </DealPreviewCard>
          ))}
        </DealPreviewRail>
      ) : !flashDealsLoading ? (
        <NoDealsPanel>No Flash Deals are live from the server yet.</NoDealsPanel>
      ) : null}

      {recentSearches.length > 0 && (
        <Section>
          <SectionTitle>Recent searches</SectionTitle>
          <RecentSearchesList>
            {recentSearches.map((search, index) => (
              <RecentSearchItem
                key={index}
                onClick={() => onRecentSearchClick(search)}
              >
                <RecentSearchContent>
                  <SmallIcon>R</SmallIcon>
                  <RecentSearchText>{search}</RecentSearchText>
                  <Badge>Bought last week</Badge>
                </RecentSearchContent>
                <RemoveButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecentSearch(search);
                  }}
                >
                  x
                </RemoveButton>
              </RecentSearchItem>
            ))}
          </RecentSearchesList>
        </Section>
      )}

      {trendingSearches.length > 0 && (
        <TrendingPanel>
          <TrendingHeader>
            <TrendingTitleBlock>
              <TrendingEyebrow>Trending in {location?.suburb || 'your area'}</TrendingEyebrow>
              <TrendingTitle>What locals are finding now</TrendingTitle>
            </TrendingTitleBlock>
            <TrendingHint>Live nearby searches</TrendingHint>
          </TrendingHeader>
          <TrendingGrid>
            {trendingSearches.map((trend, index) => (
              <TrendCard
                key={index}
                onClick={() => onTrendingSearchClick(trend.query)}
              >
                <TrendRank>{index + 1}</TrendRank>
                <TrendContent>
                  <TrendName>{trend.query}</TrendName>
                  <TrendMeta>
                    {trend.count && trend.today
                      ? `+${trend.count} today`
                      : 'Rising nearby'}
                  </TrendMeta>
                </TrendContent>
              </TrendCard>
            ))}
          </TrendingGrid>
        </TrendingPanel>
      )}

      {repeatPurchases.length > 0 && (
        <Section>
          <SectionTitle>Repeat purchases</SectionTitle>
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
          <SectionTitle>Smart shortcuts</SectionTitle>
          <SmartShortcutsGrid>
            {smartShortcuts.map((shortcut, index) => (
              <Chip
                key={index}
                $strong
                onClick={() => onShortcutClick && onShortcutClick(shortcut)}
              >
                <span>{shortcut.icon || 'S'}</span>
                <span>{shortcut.label}</span>
              </Chip>
            ))}
          </SmartShortcutsGrid>
        </Section>
      )}

      <Section>
        <SectionTitle>Shop by room</SectionTitle>
        <QuickCategoriesGrid>
          {QUICK_CATEGORIES.map((category, index) => (
            <CategoryChip
              key={index}
              $accent={category.accent}
              $featured={category.featured}
              onClick={() => onCategoryClick && onCategoryClick(category)}
            >
              <CategoryIcon $color={category.color} $accent={category.accent}>
                {category.icon}
              </CategoryIcon>
              <CategoryText>
                <CategoryLabel>{category.label}</CategoryLabel>
                <CategoryDescription>{category.description}</CategoryDescription>
              </CategoryText>
            </CategoryChip>
          ))}
        </QuickCategoriesGrid>
      </Section>
    </Container>
  );
};
