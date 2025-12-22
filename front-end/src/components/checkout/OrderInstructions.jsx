import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  margin-bottom: ${props => props.expanded ? props.theme.spacing.sm : 0};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Chevron = styled.span`
  font-size: 18px;
  color: ${props => props.theme.colors.text.tertiary};
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  transition: ${props => props.theme.transitions.swift};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const ExpandedContent = styled.div`
  animation: ${fadeIn} 0.2s ease-in;
`;

export const OrderInstructions = ({ instructions, onInstructionsChange }) => {
  const [expanded, setExpanded] = useState(!!instructions);

  return (
    <Card>
      <Header 
        expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <Title>
          📝 Delivery Instructions {expanded ? '' : '(optional)'}
        </Title>
        <Chevron expanded={expanded}>↓</Chevron>
      </Header>

      {expanded && (
        <ExpandedContent>
          <TextArea
            placeholder="Add note for rider, security, gate number..."
            value={instructions || ''}
            onChange={(e) => onInstructionsChange(e.target.value)}
            maxLength={200}
          />
        </ExpandedContent>
      )}
    </Card>
  );
};











