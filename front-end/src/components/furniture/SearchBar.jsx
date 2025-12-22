import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * Search Bar Component for Furniture
 */

const SearchBar = ({ placeholder = 'Search...', onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <SearchIcon>🔍</SearchIcon>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {query && (
        <ClearButton type="button" onClick={() => setQuery('')}>
          ✕
        </ClearButton>
      )}
    </Form>
  );
};

// Styled Components

const Form = styled.form`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 48px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  background: #f9f9f9;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2196f3;
    background: white;
  }

  &::placeholder {
    color: #999;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

export default SearchBar;

