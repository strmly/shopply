import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  pointer-events: none;
`;

const ToastItem = styled.div`
  background: ${props => {
    if (props.$type === 'success') return props.theme.colors.success[500];
    if (props.$type === 'error') return props.theme.colors.danger[500];
    if (props.$type === 'warning') return props.theme.colors.warning[500];
    return props.theme.colors.info[500];
  }};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.lg};
  min-width: 300px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  pointer-events: auto;
  animation: ${props => (props.$exiting ? slideOut : slideIn)} 0.3s ease;
  ${props => props.theme.typography.body2}
  font-weight: 500;
`;

const Icon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const Message = styled.div`
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

let toastId = 0;
const toasts = [];
let listeners = [];

const notify = (message, type = 'info', duration = 3000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

const removeToast = (id) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
};

export const toast = {
  success: (message, duration) => notify(message, 'success', duration),
  error: (message, duration) => notify(message, 'error', duration),
  warning: (message, duration) => notify(message, 'warning', duration),
  info: (message, duration) => notify(message, 'info', duration),
  remove: removeToast,
};

const ToastContainer = () => {
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    listeners.push(setActiveToasts);
    return () => {
      listeners = listeners.filter(l => l !== setActiveToasts);
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <Container>
      {activeToasts.map(toast => (
        <ToastItem key={toast.id} $type={toast.type}>
          <Icon>{getIcon(toast.type)}</Icon>
          <Message>{toast.message}</Message>
          <CloseButton onClick={() => removeToast(toast.id)}>×</CloseButton>
        </ToastItem>
      ))}
    </Container>
  );
};

export default ToastContainer;


