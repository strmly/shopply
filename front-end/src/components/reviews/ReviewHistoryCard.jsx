import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const slideDown = keyframes`
  from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProductImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  object-fit: cover;
  flex-shrink: 0;
  background: ${props => props.theme.colors.background};
`;

const ProductImagePlaceholder = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  min-width: 0;
`;

const ProductName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const StarRating = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
  flex-shrink: 0;
`;

const Star = styled.span`
  font-size: 18px;
  color: ${props => props.$filled 
    ? '#FFB800' 
    : props.theme.colors.border.light};
`;

const Body = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ReviewText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const SubmissionDate = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  ${props => props.theme.typography.body2}
  color: ${props => props.$danger 
    ? props.theme.colors.danger[600] 
    : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    opacity: 0.7;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditForm = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  animation: ${slideDown} 0.3s ease-out;
  overflow: hidden;
`;

const EditStarSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EditStar = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  line-height: 1;
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

const EditTextInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  resize: vertical;
  font-family: inherit;
  margin-bottom: ${props => props.theme.spacing.xs};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const EditCharCount = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$count > 900) return props.theme.colors.danger[600];
    if (props.$count > 800) return props.theme.colors.warning[600];
    return props.theme.colors.text.tertiary;
  }};
  font-size: 11px;
  text-align: right;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EditActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const EditButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$secondary
    ? props.theme.colors.background
    : props.theme.colors.primary};
  color: ${props => props.$secondary
    ? props.theme.colors.text.primary
    : props.theme.colors.text.inverse};
  border: ${props => props.$secondary
    ? `1px solid ${props.theme.colors.border.light}`
    : 'none'};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.$secondary
      ? props.theme.colors.surface
      : props.theme.colors.primaryHover};
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const isEditable = (createdAt) => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

export const ReviewHistoryCard = ({ review, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editContent, setEditContent] = useState(review.content || '');
  const [updating, setUpdating] = useState(false);

  const editable = isEditable(review.createdAt);
  const maxChars = 1000;
  const charCount = editContent.length;

  const handleEdit = () => {
    setIsEditing(true);
    setEditRating(review.rating);
    setEditContent(review.content || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditRating(review.rating);
    setEditContent(review.content || '');
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      await onUpdate(review.id, {
        rating: editRating,
        content: editContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(review.id);
  };

  return (
    <Card>
      <TopRow>
        {review.productImage ? (
          <ProductImage src={review.productImage} alt={review.productName} />
        ) : (
          <ProductImagePlaceholder>📦</ProductImagePlaceholder>
        )}
        <ProductInfo>
          <ProductName>{review.productName || 'Product'}</ProductName>
          <StoreName>{review.storeName || 'Store'}</StoreName>
        </ProductInfo>
        <StarRating>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} $filled={star <= review.rating}>
              ⭐
            </Star>
          ))}
        </StarRating>
      </TopRow>

      <Body>
        {isEditing ? (
          <EditForm>
            <EditStarSelector>
              {[1, 2, 3, 4, 5].map((star) => (
                <EditStar
                  key={star}
                  onClick={() => setEditRating(star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  {star <= editRating ? '⭐' : '☆'}
                </EditStar>
              ))}
            </EditStarSelector>
            <EditTextInput
              value={editContent}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setEditContent(e.target.value);
                }
              }}
              placeholder="Tell others what you liked (optional)"
              maxLength={maxChars}
            />
            <EditCharCount $count={charCount}>
              {charCount} / {maxChars}
            </EditCharCount>
            <EditActions>
              <EditButton $secondary onClick={handleCancel} disabled={updating}>
                Cancel
              </EditButton>
              <EditButton onClick={handleSave} disabled={updating || editRating === 0}>
                {updating ? 'Updating...' : 'Update Review'}
              </EditButton>
            </EditActions>
          </EditForm>
        ) : (
          <>
            {review.content && (
              <ReviewText>{review.content}</ReviewText>
            )}
            <Footer>
              <SubmissionDate>
                Submitted {formatDate(review.createdAt)}
              </SubmissionDate>
              <Actions>
                {editable && (
                  <ActionButton onClick={handleEdit}>
                    Edit review
                  </ActionButton>
                )}
                <ActionButton $danger onClick={handleDelete}>
                  Delete
                </ActionButton>
              </Actions>
            </Footer>
          </>
        )}
      </Body>
    </Card>
  );
};

