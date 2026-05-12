import React, { useState } from 'react';
import styled from 'styled-components';
import { CollapsibleSection } from './CollapsibleSection';
import { toast } from '../../../ui/Toast';

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  cursor: ${props => (props.$draggable ? 'move' : 'default')};
  opacity: ${props => (props.$isDragging ? 0.5 : 1)};
  transition: ${props => props.theme.transitions.swift};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const AddImageButton = styled.label`
  aspect-ratio: 1;
  border-radius: ${props => props.theme.radii.md};
  border: 2px dashed ${props => props.theme.colors.border.default};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.secondary};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: move;
  opacity: 0;
  transition: opacity 0.2s;

  ${ImageItem}:hover & {
    opacity: 1;
  }
`;

const PrimaryBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  ${props => props.theme.typography.caption}
`;

const HiddenInput = styled.input`
  display: none;
`;

const Hint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
`;

export const MediaSection = ({ product, onChange }) => {
  const images = product.images || [];
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = validFiles.map(file => {
      // In production, upload to server and get URL
      // For now, create object URL for preview
      return URL.createObjectURL(file);
    });

    onChange('images', [...images, ...newImages]);
    toast.success(`${validFiles.length} image(s) added`);
  };

  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange('images', newImages);
    toast.success('Image removed');
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return; // Already primary
    const newImages = [...images];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    onChange('images', newImages);
    toast.success('Primary image updated');
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onChange('images', newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success('Image order updated');
  };

  return (
    <CollapsibleSection title="Media">
      <ImageGrid>
        {images.map((image, index) => (
          <ImageItem
            key={index}
            $draggable
            $isDragging={draggedIndex === index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              borderColor: dragOverIndex === index ? '#3D81EF' : undefined,
              transform: dragOverIndex === index ? 'scale(1.05)' : undefined,
            }}
          >
            <DragHandle>⋮⋮</DragHandle>
            <Image src={image} alt={`Product ${index + 1}`} />
            {index === 0 && <PrimaryBadge>Primary</PrimaryBadge>}
            <RemoveButton onClick={() => handleImageRemove(index)}>
              ×
            </RemoveButton>
            {index !== 0 && (
              <button
                onClick={() => handleSetPrimary(index)}
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  padding: '4px 8px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Set Primary
              </button>
            )}
          </ImageItem>
        ))}
        <AddImageButton>
          <HiddenInput
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageAdd}
          />
          <span style={{ fontSize: '32px' }}>📷</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Add Image</span>
        </AddImageButton>
      </ImageGrid>
      <Hint>
        Products with photos sell 3x more. Add multiple images to show different angles.
      </Hint>
    </CollapsibleSection>
  );
};

