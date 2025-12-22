import React from 'react';
import styled from 'styled-components';

/**
 * Filter Panel Component
 * Furniture-specific filters (simplified)
 */

const FilterPanel = ({ filters, onChange, onClose }) => {
  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Filters</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>

        <Content>
          <FilterSection>
            <FilterLabel>Price Range</FilterLabel>
            <FilterOptions>
              <FilterOption>Under R1,000</FilterOption>
              <FilterOption>R1,000 - R5,000</FilterOption>
              <FilterOption>R5,000 - R10,000</FilterOption>
              <FilterOption>Over R10,000</FilterOption>
            </FilterOptions>
          </FilterSection>

          <FilterSection>
            <FilterLabel>Condition</FilterLabel>
            <FilterOptions>
              <FilterOption>New</FilterOption>
              <FilterOption>Like New</FilterOption>
              <FilterOption>Used</FilterOption>
              <FilterOption>Refurbished</FilterOption>
            </FilterOptions>
          </FilterSection>

          <FilterSection>
            <FilterLabel>Delivery</FilterLabel>
            <FilterOptions>
              <FilterOption>Delivery Available</FilterOption>
              <FilterOption>Pickup Only</FilterOption>
            </FilterOptions>
          </FilterSection>
        </Content>

        <Footer>
          <ClearButton onClick={() => onChange({})}>Clear All</ClearButton>
          <ApplyButton onClick={onClose}>Apply Filters</ApplyButton>
        </Footer>
      </Panel>
    </Overlay>
  );
};

// Styled Components

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
`;

const Panel = styled.div`
  width: 100%;
  max-height: 80vh;
  background: white;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
`;

const FilterLabel = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterOption = styled.button`
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  &.active {
    background: #e3f2fd;
    border-color: #2196f3;
    color: #1976d2;
    font-weight: 600;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ClearButton = styled.button`
  flex: 1;
  padding: 14px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ApplyButton = styled.button`
  flex: 2;
  padding: 14px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1976d2;
  }
`;

export default FilterPanel;

