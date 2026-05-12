import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 28, 51, 0.46);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  animation: ${fadeIn} 0.2s ease-in;
`;

const Panel = styled.div`
  background: #ffffff;
  border-radius: 30px 30px 0 0;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -28px 70px rgba(16, 24, 40, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  top: 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  z-index: 10;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 900;
`;

const CloseButton = styled.button`
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radii.circle};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: 900;
  font-size: 17px;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const OptionItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const OptionLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  flex: 1;
`;

const DealCard = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border: 1px solid ${props => props.$active ? 'rgba(245, 158, 11, 0.38)' : 'rgba(228, 231, 236, 0.82)'};
  border-radius: 22px;
  background:
    ${props => props.$active
      ? 'linear-gradient(115deg, rgba(254,247,227,0.98), rgba(255,255,255,0.94) 58%, rgba(241,247,255,0.86))'
      : 'linear-gradient(115deg, #ffffff, rgba(248, 250, 252, 0.9))'};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.$active ? '0 18px 38px rgba(245, 158, 11, 0.14)' : '0 12px 26px rgba(16, 24, 40, 0.05)'};

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 158, 11, 0.38);
    box-shadow: 0 22px 46px rgba(16, 24, 40, 0.1);
  }
`;

const DealBadge = styled.span`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: ${props => props.theme.colors.warning[100]};
  color: ${props => props.theme.colors.warning[600]};
  border: 1px solid rgba(245, 158, 11, 0.22);
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.12);
`;

const DealContent = styled.span`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const DealTitle = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 900;
`;

const DealDescription = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const DealToggle = styled.span`
  width: 42px;
  height: 24px;
  border-radius: 999px;
  padding: 3px;
  background: ${props => props.$active ? props.theme.colors.warning[500] : props.theme.colors.neutral[200]};
  transition: ${props => props.theme.transitions.swift};

  &::before {
    content: '';
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #ffffff;
    transform: translateX(${props => props.$active ? '18px' : '0'});
    transition: ${props => props.theme.transitions.swift};
    box-shadow: 0 4px 10px rgba(16, 24, 40, 0.14);
  }
`;

const QuickRange = styled.button`
  background: ${props => props.$active ? props.theme.colors.gradient.soft : '#ffffff'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.32)' : props.theme.colors.border.default};
  border-radius: 999px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  font-weight: 900;
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.primary};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const QuickRanges = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  padding: 18px 24px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  bottom: 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
`;

const ResetButton = styled.button`
  flex: 1;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.button}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ApplyButton = styled.button`
  flex: 2;
  background: ${props => props.theme.colors.gradient.primary};
  border: none;
  border-radius: 999px;
  padding: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.button}
  color: ${props => props.theme.colors.text.inverse};
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

export const FilterOverlay = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterToggle = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const handleCheckboxToggle = (key) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePriceRange = (min, max) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: prev.minPrice === min && prev.maxPrice === max ? undefined : min,
      maxPrice: prev.minPrice === min && prev.maxPrice === max ? undefined : max,
    }));
  };

  const handleDistance = (distance) => {
    setLocalFilters(prev => ({
      ...prev,
      maxDistance: prev.maxDistance === distance ? undefined : distance,
    }));
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Filters</Title>
          <CloseButton onClick={onClose}>x</CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionTitle>Price Range</SectionTitle>
            <QuickRanges>
              <QuickRange
                $active={localFilters.minPrice === undefined && localFilters.maxPrice === 50}
                onClick={() => handlePriceRange(undefined, 50)}
              >
                Under R50
              </QuickRange>
              <QuickRange
                $active={localFilters.minPrice === 50 && localFilters.maxPrice === 200}
                onClick={() => handlePriceRange(50, 200)}
              >
                R50 - R200
              </QuickRange>
              <QuickRange
                $active={localFilters.minPrice === 200}
                onClick={() => handlePriceRange(200, undefined)}
              >
                R200+
              </QuickRange>
            </QuickRanges>
          </Section>

          <Section>
            <SectionTitle>Distance</SectionTitle>
            <QuickRanges>
              <QuickRange
                $active={localFilters.maxDistance === 1}
                onClick={() => handleDistance(1)}
              >
                Within 1 km
              </QuickRange>
              <QuickRange
                $active={localFilters.maxDistance === 3}
                onClick={() => handleDistance(3)}
              >
                Within 3 km
              </QuickRange>
              <QuickRange
                $active={localFilters.maxDistance === 5}
                onClick={() => handleDistance(5)}
              >
                Within 5 km
              </QuickRange>
            </QuickRanges>
          </Section>

          <Section>
            <SectionTitle>Delivery Speed</SectionTitle>
            <OptionList>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.fastDelivery || false}
                  onChange={() => handleCheckboxToggle('fastDelivery')}
                />
                <OptionLabel>Deliver today</OptionLabel>
              </OptionItem>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.freeDelivery || false}
                  onChange={() => handleCheckboxToggle('freeDelivery')}
                />
                <OptionLabel>Free delivery</OptionLabel>
              </OptionItem>
            </OptionList>
          </Section>

          <Section>
            <SectionTitle>Stock Status</SectionTitle>
            <OptionList>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.inStock || false}
                  onChange={() => handleCheckboxToggle('inStock')}
                />
                <OptionLabel>In Stock</OptionLabel>
              </OptionItem>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.lowStock || false}
                  onChange={() => handleCheckboxToggle('lowStock')}
                />
                <OptionLabel>Low Stock</OptionLabel>
              </OptionItem>
            </OptionList>
          </Section>

          <Section>
            <SectionTitle>Deals</SectionTitle>
            <DealCard
              type="button"
              $active={localFilters.onSale || false}
              onClick={() => handleCheckboxToggle('onSale')}
            >
              <DealBadge>%</DealBadge>
              <DealContent>
                <DealTitle>Flash Deals</DealTitle>
                <DealDescription>Show limited offers, markdowns, and local sale picks.</DealDescription>
              </DealContent>
              <DealToggle $active={localFilters.onSale || false} aria-hidden="true" />
            </DealCard>
          </Section>

          <Section>
            <SectionTitle>Store Type</SectionTitle>
            <OptionList>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.verifiedStores || false}
                  onChange={() => handleCheckboxToggle('verifiedStores')}
                />
                <OptionLabel>Verified Stores</OptionLabel>
              </OptionItem>
            </OptionList>
          </Section>

          <Section>
            <SectionTitle>Rating</SectionTitle>
            <QuickRanges>
              <QuickRange
                $active={localFilters.minRating === 4}
                onClick={() => handleFilterToggle('minRating', 4)}
              >
                4+ Stars
              </QuickRange>
              <QuickRange
                $active={localFilters.minRating === 4.5}
                onClick={() => handleFilterToggle('minRating', 4.5)}
              >
                4.5+ Stars
              </QuickRange>
            </QuickRanges>
          </Section>
        </Content>

        <Actions>
          <ResetButton onClick={handleReset} disabled={!hasChanges}>
            Reset
          </ResetButton>
          <ApplyButton onClick={handleApply}>
            Apply Filters
          </ApplyButton>
        </Actions>
      </Panel>
    </Overlay>
  );
};

