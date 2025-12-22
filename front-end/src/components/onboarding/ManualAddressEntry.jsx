import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Input, InputContainer, Label, Button } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
`;

const SearchBar = styled.div`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md} 0;
  z-index: 10;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const StyledInput = styled(Input)`
  padding-left: ${props => `calc(${props.theme.spacing.xl} + 24px)`};
  padding-right: ${props => `calc(${props.theme.spacing.xl} + 24px)`};
`;

const AutocompleteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
`;

const AutocompleteItem = styled.button`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};
  width: 100%;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const POIBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-size: 10px;
  font-weight: 600;
  align-self: flex-start;
`;

const MapPreview = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid ${props => props.theme.colors.border.light};
  
  &::before {
    content: '🗺️';
    font-size: 24px;
  }
`;

const PlaceName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const PlaceAddress = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
`;

const MapIcon = styled.span`
  font-size: 20px;
`;

const OptionalSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PopularAreas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const PopularAreasTitle = styled(Label)`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const Chip = styled.button`
  ${props => props.theme.typography.body2}
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

// Mock popular areas - in production, fetch from API
const POPULAR_AREAS = ['Sandton', 'Melville', 'Rosebank', 'Parkhurst', 'Greenside'];

// Enhanced mock autocomplete results with POI support
const MOCK_RESULTS = [
  { name: 'Melville Spar', address: '7th Street, Melville, Johannesburg', type: 'POI' },
  { name: 'Mall of Africa', address: 'Magwa Crescent, Waterfall City, Midrand', type: 'POI' },
  { name: 'Rosebank Mall', address: 'Cradock Ave, Rosebank, Johannesburg', type: 'POI' },
  { name: 'Corner Shop by Petrol Station', address: 'Main Road, Sandton', type: 'POI' },
  { name: '123 Main Street', address: 'Main Street, Sandton, Johannesburg', type: 'address' },
  { name: '45 Oak Avenue', address: 'Oak Avenue, Rosebank, Johannesburg', type: 'address' },
];

export const ManualAddressEntry = ({ onSelectAddress, onUseCurrentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.length > 1) {
      // Enhanced search - supports informal queries like "Melville Spar", "near Mall", etc.
      const query = value.toLowerCase();
      const filtered = MOCK_RESULTS.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const addressMatch = item.address.toLowerCase().includes(query);
        // Support queries like "near X", "by X", "corner X"
        const informalMatch = query.includes('near') || query.includes('by') || query.includes('corner');
        return nameMatch || addressMatch || (informalMatch && item.type === 'POI');
      });
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item) => {
    // In production, geocode the address
    onSelectAddress({
      street: item.address.split(',')[0],
      suburb: item.address.split(',')[1]?.trim() || '',
      city: item.address.split(',')[2]?.trim() || 'Johannesburg',
      name: item.name,
    });
  };

  const handleChipClick = (area) => {
    setSearchQuery(area);
    handleSearch(area);
  };

  return (
    <Container>
      <SearchBar>
        <SearchInputWrapper>
          <SearchIcon>🔍</SearchIcon>
          <StyledInput
            type="text"
            placeholder="Search your street or complex…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => {
              setSearchQuery('');
              setResults([]);
            }}>
              ×
            </ClearButton>
          )}
        </SearchInputWrapper>

        {results.length > 0 && (
          <AutocompleteList>
            {results.map((item, index) => (
              <AutocompleteItem key={index} onClick={() => handleSelect(item)}>
                <MapPreview />
                <ItemContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlaceName>{item.name}</PlaceName>
                    {item.type === 'POI' && <POIBadge>POI</POIBadge>}
                  </div>
                  <PlaceAddress>{item.address}</PlaceAddress>
                </ItemContent>
              </AutocompleteItem>
            ))}
          </AutocompleteList>
        )}
        
        {searchQuery.length > 1 && results.length === 0 && (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#667085',
            marginTop: '16px'
          }}>
            <p>We can't find this address. Try moving the map pin or search for a nearby landmark.</p>
          </div>
        )}
      </SearchBar>

      <OptionalSection>
        <Button variant="ghost" $fullWidth onClick={onUseCurrentLocation}>
          📍 Use current location
        </Button>

        <PopularAreas>
          <PopularAreasTitle>Popular nearby areas</PopularAreasTitle>
          <Chips>
            {POPULAR_AREAS.map((area) => (
              <Chip key={area} onClick={() => handleChipClick(area)}>
                {area}
              </Chip>
            ))}
          </Chips>
        </PopularAreas>
      </OptionalSection>
    </Container>
  );
};

