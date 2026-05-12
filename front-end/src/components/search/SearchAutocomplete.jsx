import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 22px min(5vw, 48px);
  animation: ${fadeIn} 0.2s ease-in;
  max-height: 72vh;
  overflow-y: auto;
`;

const Panel = styled.div`
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.18), rgba(196, 184, 252, 0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: 18px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const Section = styled.div`
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  margin: 0 0 10px;
  font-weight: 900;
  text-transform: uppercase;
`;

const SuggestionsList = styled.div`
  display: grid;
  gap: 8px;
`;

const SuggestionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 18px;
  padding: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: rgba(61, 129, 239, 0.28);
    transform: translateX(4px);
  }
`;

const SuggestionIcon = styled.div`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 14px;
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  flex-shrink: 0;
`;

const SuggestionContent = styled.div`
  flex: 1;
  display: grid;
  gap: 2px;
  min-width: 0;
`;

const SuggestionLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const SuggestionSecondary = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const Highlight = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 900;
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

  const renderSection = (title, matches, fallbackIcon) => {
    if (!matches || matches.length === 0) return null;

    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <SuggestionsList>
          {matches.map((match, index) => (
            <SuggestionItem
              key={index}
              onClick={() => onSuggestionClick(match)}
            >
              <SuggestionIcon>{match.icon || fallbackIcon}</SuggestionIcon>
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
    );
  };

  return (
    <Container>
      <Panel>
        {renderSection('Products', directMatches, 'P')}
        {renderSection('Categories', semanticMatches, 'C')}
        {renderSection('Stores', storeMatches, 'S')}
        {renderSection('Discover', contextualMatches, 'D')}
      </Panel>
    </Container>
  );
};
