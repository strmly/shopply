import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';

const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const ConfettiPiece = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  top: -10px;
  left: ${props => props.left}%;
  animation: ${confetti} ${props => props.duration}s linear forwards;
  animation-delay: ${props => props.delay}s;
`;

const SuccessIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.colors.successSoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-in;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 32px;
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.2;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.xxl};
  line-height: 1.6;
  max-width: 400px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 320px;
`;

const InfoBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.info[100]};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  max-width: 400px;
`;

export const SuccessScreen = ({ onAddProduct, onViewDashboard }) => {
  const navigate = useNavigate();
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    // Generate confetti pieces
    const colors = [
      '#3D81EF', '#7EC1F6', '#C4B8FC', '#15A17C', '#F59E0B', '#C62850'
    ];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfettiPieces(pieces);

    // Clear confetti after animation
    const timer = setTimeout(() => setConfettiPieces([]), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct();
    } else {
      navigate('/seller/dashboard');
    }
  };

  const handleViewDashboard = () => {
    if (onViewDashboard) {
      onViewDashboard();
    } else {
      navigate('/seller/dashboard');
    }
  };

  return (
    <Container>
      {confettiPieces.map(piece => (
        <ConfettiPiece
          key={piece.id}
          left={piece.left}
          duration={piece.duration}
          delay={piece.delay}
          color={piece.color}
        />
      ))}
      
      <SuccessIcon>🎉</SuccessIcon>
      
      <Title>Your store is now ready!</Title>
      
      <Subtitle>
        Congratulations! Your store has been set up successfully. 
        Start adding products to begin selling to your neighborhood.
      </Subtitle>

      <InfoBox>
        <strong>What's next?</strong>
        <br />
        Your store is now under review. You'll receive a notification once it's approved and live.
      </InfoBox>

      <ButtonGroup>
        <Button 
          variant="primary" 
          onClick={handleAddProduct}
          $fullWidth
        >
          Add Your First Product
        </Button>
        <Button 
          variant="outline" 
          onClick={handleViewDashboard}
          $fullWidth
        >
          Explore Dashboard
        </Button>
      </ButtonGroup>
    </Container>
  );
};
