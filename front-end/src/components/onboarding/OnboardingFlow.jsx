import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WelcomeScreen } from './WelcomeScreen';
import { PermissionRequestScreen } from './PermissionRequestScreen';
import { LocationDetectingScreen } from './LocationDetectingScreen';
import { ManualAddressEntry } from './ManualAddressEntry';
import { AddressConfirmationScreen } from './AddressConfirmationScreen';
import { UserProfileSetup } from './UserProfileSetup';

const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  PERMISSION: 'permission',
  DETECTING: 'detecting',
  MANUAL_ENTRY: 'manual_entry',
  CONFIRMATION: 'confirmation',
  PROFILE: 'profile',
  COMPLETE: 'complete',
};

const Toast = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1000;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

export const OnboardingFlow = ({ onComplete, onBrowseAsGuest }) => {
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.WELCOME);
  const [addressData, setAddressData] = useState(null);
  const [location, setLocation] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Request geolocation permission and detect location
  const handleEnableLocation = async () => {
    setCurrentStep(ONBOARDING_STEPS.DETECTING);

    if (!navigator.geolocation) {
      // No geolocation support, set default and go to home
      const defaultLocation = {
        lat: -26.1076,
        lng: 28.0567,
      };
      const defaultAddress = {
        street: 'Main Street',
        suburb: 'Sandton',
        city: 'Johannesburg',
      };
      setLocation(defaultLocation);
      setAddressData(defaultAddress);
      
      localStorage.setItem('shopply_location', JSON.stringify({
        suburb: defaultAddress.suburb,
        city: defaultAddress.city,
        ...defaultLocation,
      }));
      
      onComplete();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(detectedLocation);
        
        // Reverse geocode to get address (mock for now)
        // In production, use a geocoding service
        const mockAddress = {
          street: 'Detected Street',
          suburb: 'Sandton',
          city: 'Johannesburg',
        };
        setAddressData(mockAddress);
        
        // Save to localStorage and go directly to home
        localStorage.setItem('shopply_location', JSON.stringify({
          suburb: mockAddress.suburb,
          city: mockAddress.city,
          ...detectedLocation,
        }));
        
        showToast(`Location set to ${mockAddress.suburb}`);
        onComplete();
      },
      (error) => {
        console.error('Geolocation error:', error);
        // On error, set default location and go to home
        const defaultLocation = {
          lat: -26.1076,
          lng: 28.0567,
        };
        const defaultAddress = {
          street: 'Main Street',
          suburb: 'Sandton',
          city: 'Johannesburg',
        };
        setLocation(defaultLocation);
        setAddressData(defaultAddress);
        
        localStorage.setItem('shopply_location', JSON.stringify({
          suburb: defaultAddress.suburb,
          city: defaultAddress.city,
          ...defaultLocation,
        }));
        
        onComplete();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleEnterManually = () => {
    // Skip manual entry and go directly to home with default location
    const defaultLocation = {
      lat: -26.1076,
      lng: 28.0567,
    };
    const defaultAddress = {
      street: 'Main Street',
      suburb: 'Sandton',
      city: 'Johannesburg',
    };
    setLocation(defaultLocation);
    setAddressData(defaultAddress);
    
    // Save to localStorage
    localStorage.setItem('shopply_location', JSON.stringify({
      suburb: defaultAddress.suburb,
      city: defaultAddress.city,
      ...defaultLocation,
    }));
    
    // Go directly to home
    onComplete();
  };

  const handleSelectAddress = (address) => {
    // In production, geocode the address to get coordinates
    const mockLocation = {
      lat: -26.1076 + (Math.random() - 0.5) * 0.1,
      lng: 28.0567 + (Math.random() - 0.5) * 0.1,
    };
    setLocation(mockLocation);
    setAddressData(address);
    
    // Save to localStorage and go directly to home
    localStorage.setItem('shopply_location', JSON.stringify({
      suburb: address.suburb,
      city: address.city,
      ...mockLocation,
    }));
    
    showToast(`Location set to ${address.suburb}`);
    onComplete();
  };

  const handleConfirmAddress = async (confirmedAddress) => {
    // Save address to backend
    try {
      const { API_BASE_URL } = await import('../../config/api.js');
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...confirmedAddress,
          isDefault: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAddressData(data.data);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    
    // Save to localStorage and complete onboarding
    localStorage.setItem('shopply_location', JSON.stringify({
      suburb: confirmedAddress.suburb,
      city: confirmedAddress.city,
      ...confirmedAddress.location,
    }));
    showToast(`Location set to ${confirmedAddress.suburb}`);
    // Skip profile and go directly to home
    onComplete();
  };

  const handleProfileComplete = async (profileData) => {
    // Save user profile to backend
    try {
      const { API_BASE_URL } = await import('../../config/api.js');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          address: addressData,
          location: location,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Complete anyway for demo
      onComplete();
    }
  };

  const handleProfileSkip = () => {
    // Complete onboarding without profile
    onComplete();
  };

  const handleEditManually = () => {
    setCurrentStep(ONBOARDING_STEPS.MANUAL_ENTRY);
  };

  const handleUseCurrentLocation = () => {
    handleEnableLocation();
  };

  return (
    <>
      {currentStep === ONBOARDING_STEPS.WELCOME && (
        <WelcomeScreen
          onContinue={() => setCurrentStep(ONBOARDING_STEPS.PERMISSION)}
          onBrowseAsGuest={onBrowseAsGuest}
        />
      )}

      {currentStep === ONBOARDING_STEPS.PERMISSION && (
        <PermissionRequestScreen
          onEnableLocation={handleEnableLocation}
          onEnterManually={handleEnterManually}
        />
      )}

      {currentStep === ONBOARDING_STEPS.DETECTING && (
        <LocationDetectingScreen />
      )}

      {currentStep === ONBOARDING_STEPS.MANUAL_ENTRY && (
        <ManualAddressEntry
          onSelectAddress={handleSelectAddress}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      )}

      {currentStep === ONBOARDING_STEPS.CONFIRMATION && (
        <AddressConfirmationScreen
          initialAddress={addressData}
          initialLocation={location}
          onConfirm={handleConfirmAddress}
          onEdit={handleEditManually}
        />
      )}

      {currentStep === ONBOARDING_STEPS.PROFILE && (
        <UserProfileSetup
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />
      )}

      {toast && <Toast>{toast}</Toast>}
    </>
  );
};

