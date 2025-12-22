import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Input, InputContainer, Label, Button } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.xxl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Stepper = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
`;

const OptionalLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: 400;
  margin-left: ${props => props.theme.spacing.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

const SkipButton = styled.button`
  ${props => props.theme.typography.body2}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

export const UserProfileSetup = ({ onComplete, onSkip }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateMobile = (mobile) => {
    if (!mobile) return true; // Optional
    const mobileRegex = /^[\d\s\-\+\(\)]+$/;
    return mobileRegex.test(mobile) && mobile.replace(/\D/g, '').length >= 10;
  };

  const validateEmail = (email) => {
    if (!email) return true; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (formData.mobile && !validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onComplete(formData);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Complete your profile</Title>
        <Stepper>Step 2 of 2</Stepper>
      </Header>

      <Form>
        <InputContainer>
          <Label>
            Name
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your name"
            required
          />
          <HelperText>Required for delivery</HelperText>
        </InputContainer>

        <InputContainer>
          <Label>
            Mobile Number
            <OptionalLabel>(Optional)</OptionalLabel>
          </Label>
          <Input
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            placeholder="+27 12 345 6789"
            error={errors.mobile}
          />
          {errors.mobile && (
            <HelperText style={{ color: '#C62850' }}>{errors.mobile}</HelperText>
          )}
        </InputContainer>

        <InputContainer>
          <Label>
            Email
            <OptionalLabel>(Optional)</OptionalLabel>
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your.email@example.com"
            error={errors.email}
          />
          {errors.email && (
            <HelperText style={{ color: '#C62850' }}>{errors.email}</HelperText>
          )}
        </InputContainer>
      </Form>

      <ButtonGroup>
        <Button variant="primary" $fullWidth onClick={handleSubmit}>
          Continue
        </Button>
        <SkipButton onClick={onSkip}>
          Skip for now
        </SkipButton>
      </ButtonGroup>
    </Container>
  );
};

const HelperText = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

