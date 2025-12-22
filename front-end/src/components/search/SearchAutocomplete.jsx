import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.2s ease-in;
  max-height: 70vh;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h4`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const SuggestionItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`;

const SuggestionIcon = styled.div`
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  flex-shrink: 0;
`;

const SuggestionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SuggestionLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const SuggestionSecondary = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const Highlight = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

const highlightText = (text, query) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <Highlight key={index}>{part}</Highlight>
    ) : (
      part
    )
  );
};

export const SearchAutocomplete = ({ suggestions, query, onSuggestionClick }) => {
  if (!suggestions) return null;

  const { directMatches, semanticMatches, storeMatches, contextualMatches } = suggestions;
  const hasAnySuggestions = directMatches.length > 0 || semanticMatches.length > 0 || storeMatches.length > 0 || (contextualMatches && contextualMatches.length > 0);

  if (!hasAnySuggestions) return null;

  return (
    <Container>
      {directMatches.length > 0 && (
        <Section>
          <SectionTitle>Products</SectionTitle>
          <SuggestionsList>
            {directMatches.map((match, index) => (
              <SuggestionItem
                key={index}
                onClick={() => onSuggestionClick(match)}
              >
                <SuggestionIcon>{match.icon || '🛍️'}</SuggestionIcon>
                <SuggestionContent>
                  <SuggestionLabel>{highlightText(match.label, query)}</SuggestionLabel>
                  {match.secondary && (
                    <SuggestionSecondary>{match.secondary}</SuggestionSecondary>
                  )}
                </SuggestionContent>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Section>
      )}

      {semanticMatches.length > 0 && (
        <Section>
          <SectionTitle>Categories</SectionTitle>
          <SuggestionsList>
            {semanticMatches.map((match, index) => (
              <SuggestionItem
                key={index}
                onClick={() => onSuggestionClick(match)}
              >
                <SuggestionIcon>{match.icon || '📂'}</SuggestionIcon>
                <SuggestionContent>
                  <SuggestionLabel>{highlightText(match.label, query)}</SuggestionLabel>
                  {match.secondary && (
                    <SuggestionSecondary>{match.secondary}</SuggestionSecondary>
                  )}
                </SuggestionContent>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Section>
      )}

      {storeMatches.length > 0 && (
        <Section>
          <SectionTitle>Stores</SectionTitle>
          <SuggestionsList>
            {storeMatches.map((match, index) => (
              <SuggestionItem
                key={index}
                onClick={() => onSuggestionClick(match)}
              >
                <SuggestionIcon>{match.icon || '🏪'}</SuggestionIcon>
                <SuggestionContent>
                  <SuggestionLabel>{highlightText(match.label, query)}</SuggestionLabel>
                  {match.secondary && (
                    <SuggestionSecondary>{match.secondary}</SuggestionSecondary>
                  )}
                </SuggestionContent>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Section>
      )}

      {contextualMatches && contextualMatches.length > 0 && (
        <Section>
          <SectionTitle>💡 Discover</SectionTitle>
          <SuggestionsList>
            {contextualMatches.map((match, index) => (
              <SuggestionItem
                key={index}
                onClick={() => onSuggestionClick(match)}
              >
                <SuggestionIcon>{match.icon || '💡'}</SuggestionIcon>
                <SuggestionContent>
                  <SuggestionLabel>{highlightText(match.label, query)}</SuggestionLabel>
                  {match.secondary && (
                    <SuggestionSecondary>{match.secondary}</SuggestionSecondary>
                  )}
                </SuggestionContent>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Section>
      )}
    </Container>
  );
};

