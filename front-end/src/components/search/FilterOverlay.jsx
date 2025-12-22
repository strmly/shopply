import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  animation: ${fadeIn} 0.2s ease-in;
`;

const Panel = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.xl} ${props => props.theme.radii.xl} 0 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
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
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 10;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
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
  padding: ${props => props.theme.spacing.xl};
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
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
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

const QuickRange = styled.button`
  background: ${props => props.active ? props.theme.colors.primarySoftBg : props.theme.colors.surface};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  font-weight: 500;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.primary};

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
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  position: sticky;
  bottom: 0;
  background: ${props => props.theme.colors.background};
`;

const ResetButton = styled.button`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.button}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ApplyButton = styled.button`
  flex: 2;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.button}
  color: ${props => props.theme.colors.text.inverse};
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
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
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionTitle>Price Range</SectionTitle>
            <QuickRanges>
              <QuickRange
                active={localFilters.minPrice === undefined && localFilters.maxPrice === 50}
                onClick={() => handlePriceRange(undefined, 50)}
              >
                Under R50
              </QuickRange>
              <QuickRange
                active={localFilters.minPrice === 50 && localFilters.maxPrice === 200}
                onClick={() => handlePriceRange(50, 200)}
              >
                R50 - R200
              </QuickRange>
              <QuickRange
                active={localFilters.minPrice === 200}
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
                active={localFilters.maxDistance === 1}
                onClick={() => handleDistance(1)}
              >
                Within 1 km
              </QuickRange>
              <QuickRange
                active={localFilters.maxDistance === 3}
                onClick={() => handleDistance(3)}
              >
                Within 3 km
              </QuickRange>
              <QuickRange
                active={localFilters.maxDistance === 5}
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
            <OptionList>
              <OptionItem>
                <Checkbox
                  type="checkbox"
                  checked={localFilters.onSale || false}
                  onChange={() => handleCheckboxToggle('onSale')}
                />
                <OptionLabel>On Sale</OptionLabel>
              </OptionItem>
            </OptionList>
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
                active={localFilters.minRating === 4}
                onClick={() => handleFilterToggle('minRating', 4)}
              >
                4+ Stars
              </QuickRange>
              <QuickRange
                active={localFilters.minRating === 4.5}
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

