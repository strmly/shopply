import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const AskButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.surface : props.theme.colors.gradient.primary};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.inverse};
  border: 1px solid ${props => props.$active ? props.theme.colors.border.default : 'transparent'};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
`;

const AskForm = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  animation: ${fadeIn} 0.25s ease-in;
`;

const FormLabel = styled.label`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  resize: vertical;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover { background: ${props => props.theme.colors.surface}; }
`;

const SubmitButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-weight: 700;
  font-size: 13px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: ${props => props.theme.transitions.swift};

  &:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const QuestionCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const QuestionText = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AnswerCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  border-left: 3px solid ${props => props.theme.colors.successBase};
`;

const AnswerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: 4px;
`;

const AnswerAuthor = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 12px;
`;

const AnswerDistance = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const AnswerText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  line-height: 1.5;
`;

const AnswerActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const HelpfulButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const VerifiedBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.successSoftBg};
  color: ${props => props.theme.colors.successBase};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 9px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

const MetaText = styled.div`
  font-size: 11px;
  color: #666;
`;

import API_BASE_URL from '@config/api';

export const LocalQA = ({ productId, location }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [productId, location]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(
        `${API_BASE_URL}/community/products/${productId}/questions?location=${locationParam}`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/community/products/${productId}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: trimmed,
            userId: 'default',
            userName: 'You',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setQuestions(prev => [data.data, ...prev]);
        setQuestionText('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>❓ Questions from Your Area</Title>
        <AskButton $active={showForm} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : 'Ask Question'}
        </AskButton>
      </Header>

      {showForm && (
        <AskForm>
          <FormLabel htmlFor="qa-input">Your question about this product</FormLabel>
          <Textarea
            id="qa-input"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            placeholder="e.g. Does this come with assembly instructions?"
            autoFocus
          />
          <FormActions>
            <CancelButton onClick={() => { setShowForm(false); setQuestionText(''); }}>
              Cancel
            </CancelButton>
            <SubmitButton
              disabled={!questionText.trim() || submitting}
              onClick={handleSubmitQuestion}
            >
              {submitting ? 'Posting…' : 'Post Question'}
            </SubmitButton>
          </FormActions>
        </AskForm>
      )}

      {questions.length === 0 ? (
        <EmptyState>
          <p>No questions yet.</p>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            Be the first to ask a question!
          </p>
        </EmptyState>
      ) : (
        <QuestionsList>
          {questions.map((question) => (
            <QuestionCard key={question.id}>
              <QuestionHeader>
                <div style={{ fontSize: '20px' }}>❓</div>
                <div style={{ flex: 1 }}>
                  <QuestionText>{question.question}</QuestionText>
                  <MetaText>
                    {question.userName}
                    {question.userLocation?.distance && ` (${question.userLocation.distance} km away)`}
                  </MetaText>
                </div>
              </QuestionHeader>

              {question.answers && question.answers.length > 0 ? (
                question.answers.map((answer) => (
                  <AnswerCard key={answer.id}>
                    <AnswerHeader>
                      <AnswerAuthor>
                        {answer.userName}
                        {answer.verifiedPurchase && (
                          <VerifiedBadge style={{ marginLeft: '6px' }}>
                            ✓ Verified Buyer
                          </VerifiedBadge>
                        )}
                      </AnswerAuthor>
                      {answer.userLocation?.distance && (
                        <AnswerDistance>({answer.userLocation.distance} km away)</AnswerDistance>
                      )}
                    </AnswerHeader>
                    <AnswerText>{answer.content}</AnswerText>
                    <AnswerActions>
                      <HelpfulButton>
                        👍 Helpful ({answer.helpfulCount || 0})
                      </HelpfulButton>
                    </AnswerActions>
                  </AnswerCard>
                ))
              ) : (
                <MetaText style={{ fontStyle: 'italic', marginTop: '8px' }}>
                  No answers yet. Be the first to answer!
                </MetaText>
              )}
            </QuestionCard>
          ))}
        </QuestionsList>
      )}
    </Container>
  );
};
