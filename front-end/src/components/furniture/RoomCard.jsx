import React from 'react';
import styled from 'styled-components';

/**
 * Room Card Component
 * Displays room category for navigation
 */

const RoomCard = ({ room, onClick }) => {
  return (
    <Card onClick={onClick}>
      <IconContainer>
        <Icon>{room.icon}</Icon>
      </IconContainer>
      <RoomName>{room.label}</RoomName>
      <RoomDescription>{room.description}</RoomDescription>
    </Card>
  );
};

// Styled Components

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    background: #f9f9f9;
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-bottom: 12px;
`;

const Icon = styled.span`
  font-size: 28px;
`;

const RoomName = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
`;

const RoomDescription = styled.p`
  font-size: 11px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export default RoomCard;

