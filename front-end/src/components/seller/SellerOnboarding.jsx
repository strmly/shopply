import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Button } from '../ui/Button';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { StoreBasicInfo } from './onboarding/StoreBasicInfo';
import { StoreSetup } from './onboarding/StoreSetup';
import { AddressLocation } from './onboarding/AddressLocation';
import { CategorySelection } from './onboarding/CategorySelection';
import { KYCVerification } from './onboarding/KYCVerification';
import { BankAccountSetup } from './onboarding/BankAccountSetup';
import { SuccessScreen } from './onboarding/SuccessScreen';

import API_BASE_URL from '@config/api';
const LOCAL_STORAGE_KEY_ID = 'sellerOnboardingId';
const LOCAL_STORAGE_KEY_DRAFT = 'sellerOnboardingDraft';

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 560px;
  margin: 0 auto;
`;

const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const Stepper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.pill};
  width: ${props => props.progress}%;
  transition: width 0.3s ease-out;
`;

const StepperDots = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

const Dot = styled.div`
  width: ${props => (props.active ? '10px' : '8px')};
  height: ${props => (props.active ? '10px' : '8px')};
  border-radius: 50%;
  background: ${props =>
    props.active
      ? props.theme.colors.primary
      : props.completed
      ? props.theme.colors.successBase
      : props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  
  ${props => props.active && `
    box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
  `}
`;

const StepLabel = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-top: ${props => props.theme.spacing.xs};
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Footer = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
`;

const SavingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.successBase};
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.dangerSoftBg};
  border: 1px solid ${props => props.theme.colors.dangerBase};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.dangerBase};
  ${props => props.theme.typography.body2}
  margin-bottom: ${props => props.theme.spacing.md};
`;

const steps = [
  { label: 'Welcome', key: 'welcome' },
  { label: 'Basic Info', key: 'basicInfo' },
  { label: 'Store Setup', key: 'storeSetup' },
  { label: 'Address', key: 'address' },
  { label: 'Categories', key: 'categories' },
  { label: 'KYC', key: 'kyc' },
  { label: 'Payouts', key: 'payouts' },
];

export function SellerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sellerId, setSellerId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState({
    phone: '',
    email: '',
    legalBusinessName: '',
    storeBasicInfo: {},
    storeSetup: {},
    address: null,
    categories: [],
    kycDocuments: {},
    bankAccount: {},
  });

  // Load draft from localStorage and/or backend
  useEffect(() => {
    const storedId = localStorage.getItem(LOCAL_STORAGE_KEY_ID);
    const storedDraft = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);

    if (storedDraft) {
      try {
        const parsed = JSON.parse(storedDraft);
        setData(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore parsing errors
      }
    }

    if (storedId) {
      setSellerId(storedId);
      fetchOnboarding(storedId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistDraft = (nextData, nextStepIndex = currentStep) => {
    const merged = { ...data, ...nextData };
    setData(merged);

    localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(merged));

    // Fire and forget save to backend for resilience
    if (sellerId) {
      saveToBackend(merged, nextStepIndex + 1);
    }
  };

  const fetchOnboarding = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sellers/onboarding/${id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        setData(prev => ({
          ...prev,
          storeSetup: json.data.storeSetup || prev.storeSetup,
          address: json.data.address || prev.address,
          categories: json.data.categories || prev.categories,
          kycDocuments: json.data.kycDocuments || prev.kycDocuments,
          bankAccount: json.data.bankAccount || prev.bankAccount,
        }));

        // Align step with backend if present
        if (json.data.onboardingStep) {
          setCurrentStep(Math.min(json.data.onboardingStep - 1, steps.length - 1));
        }
      }
    } catch (error) {
      console.error('Error loading seller onboarding:', error);
    }
  };

  const ensureSellerSession = async () => {
    if (sellerId) return sellerId;

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/sellers/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingStep: currentStep + 1,
          storeBasicInfo: {},
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.id != null) {
        const idString = String(json.data.id);
        setSellerId(idString);
        localStorage.setItem(LOCAL_STORAGE_KEY_ID, idString);
        return idString;
      }
    } catch (error) {
      console.error('Error creating seller onboarding session:', error);
    } finally {
      setSaving(false);
    }

    return null;
  };

  const saveToBackend = async (payload, stepNumber) => {
    const id = await ensureSellerSession();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/sellers/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          onboardingStep: stepNumber,
        }),
      });

      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.message || 'Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving seller onboarding:', error);
      setError(error.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async (partial) => {
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    const merged = { ...data, ...partial };

    // Persist locally and remotely
    localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(merged));
    setData(merged);
    await saveToBackend(partial, nextStep + 1);

    setCurrentStep(nextStep);
  };

  const handleBack = (partial) => {
    const prevStep = Math.max(currentStep - 1, 0);
    if (partial) {
      persistDraft(partial, prevStep);
    }
    setCurrentStep(prevStep);
  };

  const handleComplete = async () => {
    const id = await ensureSellerSession();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/sellers/onboarding/${id}/complete`, {
        method: 'POST',
      });
      const json = await res.json();

      if (res.ok && json.success) {
        localStorage.setItem('sellerOnboardingComplete', 'true');
        localStorage.removeItem(LOCAL_STORAGE_KEY_DRAFT);
        setCompleted(true);
      } else {
        throw new Error(json.message || json.errors?.join(', ') || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing seller onboarding:', error);
      setError(error.message || 'Failed to submit. Please check all required fields.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    if (completed) {
      return (
        <SuccessScreen
          onAddProduct={() => navigate('/seller/dashboard')}
          onViewDashboard={() => navigate('/seller/dashboard')}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <WelcomeScreen
            onNext={() => setCurrentStep(1)}
            onSignIn={() => navigate('/profile')}
          />
        );
      case 1:
        return (
          <StoreBasicInfo
            data={data}
            onNext={(payload) => {
              handleNext({
                ...payload,
                phone: payload.phone || data.phone,
                email: payload.email || data.email,
              });
            }}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <StoreSetup
            data={data.storeSetup || {}}
            onNext={(payload) =>
              handleNext({ storeSetup: payload.storeInfo || payload.storeSetup || {} })
            }
            onBack={() => handleBack()}
          />
        );
      case 3:
        return (
          <AddressLocation
            data={{ address: data.address }}
            onNext={(payload) => handleNext({ address: payload.address })}
            onBack={() => handleBack()}
          />
        );
      case 4:
        return (
          <CategorySelection
            data={{ categories: data.categories }}
            onNext={(payload) => handleNext({ categories: payload.categories })}
            onBack={() => handleBack()}
          />
        );
      case 5:
        return (
          <KYCVerification
            data={{ kycDocuments: data.kycDocuments }}
            onNext={(payload) => handleNext({ kycDocuments: payload.kycDocuments })}
            onBack={() => handleBack()}
          />
        );
      case 6:
      default:
        return (
          <BankAccountSetup
            data={{ bankAccount: data.bankAccount }}
            onNext={async (payload) => {
              await handleNext({ bankAccount: payload.bankAccount });
              await handleComplete();
            }}
            onBack={() => handleBack()}
          />
        );
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Preparing seller onboarding…</Title>
        <Subtitle>Loading your progress so you can pick up where you left off.</Subtitle>
      </Container>
    );
  }

  // Don't show stepper on welcome or success screens
  const showStepper = currentStep > 0 && !completed;
  const progress = showStepper ? ((currentStep) / (steps.length - 1)) * 100 : 0;

  return (
    <Container>
      {showStepper && (
        <Stepper>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          <StepperDots>
            {steps.slice(1).map((step, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;
              
              return (
                <Dot
                  key={step.key}
                  active={isActive}
                  completed={isCompleted}
                  aria-hidden="true"
                />
              );
            })}
          </StepperDots>
          <StepLabel>
            Step {currentStep} of {steps.length - 1} — {steps[currentStep]?.label}
          </StepLabel>
        </Stepper>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {!completed && currentStep > 0 && (
        <>
          <Title>Set up your store</Title>
          <Subtitle>
            A simple, guided setup to get your store ready for nearby shoppers. Your progress auto-saves
            as you go.
          </Subtitle>
        </>
      )}

      {renderStep()}

      {!completed && showStepper && (
        <Footer>
          {saving ? (
            <SavingIndicator>
              <span>💾</span>
              <span>Saving your progress…</span>
            </SavingIndicator>
          ) : (
            <>
              <span>✓</span>
              <span>Changes are saved automatically.</span>
            </>
          )}
        </Footer>
      )}
    </Container>
  );
}

