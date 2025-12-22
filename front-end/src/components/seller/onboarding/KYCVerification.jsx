import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';
import { ErrorMessage, HelperText } from '../../ui/Input';
import { validateFile } from '../../../utils/validation';

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UploadCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px dashed ${props => {
    if (props.$error) return props.theme.colors.dangerBase;
    if (props.uploaded) return props.theme.colors.successBase;
    return props.theme.colors.border.light;
  }};
  border-radius: ${props => props.theme.radii.lg};
  text-align: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => {
      if (props.$error) return props.theme.colors.dangerBase;
      return props.theme.colors.primary;
    }};
    background: ${props => {
      if (props.$error) return props.theme.colors.dangerSoftBg;
      return props.theme.colors.primarySoftBg;
    }};
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const UploadText = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  margin-bottom: 4px;
`;

const UploadHint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const InfoBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

export const KYCVerification = ({ onNext, onBack, data }) => {
  const [uploads, setUploads] = useState({
    idDocument: data.kycDocuments?.idDocument || null,
    businessRegistration: data.kycDocuments?.businessRegistration || null,
    selfie: data.kycDocuments?.selfie || null,
  });

  const [errors, setErrors] = useState({});

  const handleUpload = (type, file) => {
    if (file) {
      // Validate file
      const isRequired = type === 'idDocument' || type === 'selfie';
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB for documents
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
        required: isRequired,
      });

      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [type]: validation.error }));
        return;
      }

      // Clear error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });

      // Read file
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploads({ ...uploads, [type]: reader.result });
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, [type]: 'Failed to read file. Please try again.' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required documents
    const newErrors = {};
    if (!uploads.idDocument) {
      newErrors.idDocument = 'ID document is required';
    }
    if (!uploads.selfie) {
      newErrors.selfie = 'Selfie verification is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    onNext({ kycDocuments: uploads });
  };

  return (
    <Container>
      <Title>KYC Verification</Title>
      <Subtitle>Verify your identity to start selling</Subtitle>

      <InfoBox>
        <strong>What is this used for?</strong> We verify your identity to ensure a safe marketplace for all users. Your documents are securely encrypted.
      </InfoBox>

      <UploadSection>
        <UploadCard
          uploaded={!!uploads.idDocument}
          onClick={() => document.getElementById('id-upload').click()}
          $error={!!errors.idDocument}
        >
          <UploadIcon>{uploads.idDocument ? '✅' : '📄'}</UploadIcon>
          <UploadText>ID Document *</UploadText>
          <UploadHint>Upload a clear photo of your ID</UploadHint>
          <input
            id="id-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload('idDocument', e.target.files[0])}
          />
        </UploadCard>
        {errors.idDocument && (
          <ErrorMessage style={{ marginTop: '-8px', marginBottom: '8px' }}>
            <span>⚠️</span>
            <span>{errors.idDocument}</span>
          </ErrorMessage>
        )}

        <UploadCard
          uploaded={!!uploads.businessRegistration}
          onClick={() => document.getElementById('business-upload').click()}
          $error={!!errors.businessRegistration}
        >
          <UploadIcon>{uploads.businessRegistration ? '✅' : '📋'}</UploadIcon>
          <UploadText>Business Registration (Optional)</UploadText>
          <UploadHint>If you have a registered business</UploadHint>
          <input
            id="business-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload('businessRegistration', e.target.files[0])}
          />
        </UploadCard>
        {errors.businessRegistration && (
          <ErrorMessage style={{ marginTop: '-8px', marginBottom: '8px' }}>
            <span>⚠️</span>
            <span>{errors.businessRegistration}</span>
          </ErrorMessage>
        )}

        <UploadCard
          uploaded={!!uploads.selfie}
          onClick={() => document.getElementById('selfie-upload').click()}
          $error={!!errors.selfie}
        >
          <UploadIcon>{uploads.selfie ? '✅' : '📸'}</UploadIcon>
          <UploadText>Selfie Verification *</UploadText>
          <UploadHint>Take a selfie holding your ID</UploadHint>
          <input
            id="selfie-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="user"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload('selfie', e.target.files[0])}
          />
        </UploadCard>
        {errors.selfie && (
          <ErrorMessage style={{ marginTop: '-8px', marginBottom: '8px' }}>
            <span>⚠️</span>
            <span>{errors.selfie}</span>
          </ErrorMessage>
        )}
        {!errors.selfie && (
          <HelperText style={{ marginTop: '-8px', marginBottom: '8px' }}>
            Max 10MB. Formats: JPG, PNG, WebP
          </HelperText>
        )}
      </UploadSection>

      <ButtonGroup>
        <Button type="button" onClick={onBack} style={{ flex: 1, background: 'transparent', border: '1px solid #ddd' }}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} style={{ flex: 1 }}>
          Continue
        </Button>
      </ButtonGroup>
    </Container>
  );
};

