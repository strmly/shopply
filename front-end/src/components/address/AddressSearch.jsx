import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-right: ${props => props.theme.spacing.xl};
  border: 2px solid ${props => 
    props.$focused 
      ? props.theme.colors.primary 
      : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
  pointer-events: none;
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  animation: ${fadeIn} 0.2s ease-in;
`;

const SuggestionItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  text-align: left;
  background: ${props => props.theme.colors.background};
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionText = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing.md};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.md};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
`;

import API_BASE_URL from '@config/api';

export const AddressSearch = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Search your street, building, or landmark",
  debounceMs = 300 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/addresses/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, debounceMs);
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion.formatted || suggestion.street);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    if (value && value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <SearchContainer ref={containerRef}>
      <SearchInput
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        $focused={focused}
      />
      <SearchIcon>🔍</SearchIcon>
      
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <SuggestionsList>
          {loading ? (
            <LoadingState>Searching...</LoadingState>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onClick={() => handleSelect(suggestion)}
              >
                <SuggestionText>{suggestion.formatted || suggestion.street}</SuggestionText>
              </SuggestionItem>
            ))
          ) : (
            <EmptyState>No suggestions found</EmptyState>
          )}
        </SuggestionsList>
      )}
    </SearchContainer>
  );
};

