# Onboarding & Location Flow - Implementation Guide

## Overview

This document describes the complete onboarding and location flow implementation for Shopply, following the detailed UX/UI specification.

## Features Implemented

### ✅ Frontend Components

1. **Welcome Screen** - First impression with brand messaging
2. **Permission Request Screen** - Location permission explanation
3. **Location Detecting Screen** - Loading state during geolocation
4. **Manual Address Entry** - Autocomplete address search
5. **Address Confirmation Screen** - Map with draggable pin for precise location
6. **User Profile Setup** - Optional profile completion
7. **Home Screen** - Localized home view after onboarding

### ✅ Backend API

1. **Address Management**
   - Create, read, update, delete addresses
   - Coordinate validation
   - Default address management

2. **User Management**
   - User profile with location data
   - Onboarding completion tracking

## Setup Instructions

### Backend Setup

```bash
cd back-end
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd front-end
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

**Note:** You need to install the new dependencies:
- `react-router-dom` - For routing (if needed)
- `leaflet` & `react-leaflet` - For map functionality

## API Endpoints

### Addresses

- `POST /api/addresses` - Create new address
- `GET /api/addresses/:id` - Get address by ID
- `GET /api/addresses/user/:userId` - Get user addresses
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `GET /api/addresses/validate?lat=...&lng=...` - Validate coordinates

### Users

- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Flow States

The onboarding flow manages the following states:

1. **WELCOME** - Initial welcome screen
2. **PERMISSION** - Location permission request
3. **DETECTING** - Auto-detecting location
4. **MANUAL_ENTRY** - Manual address entry
5. **CONFIRMATION** - Address confirmation with map
6. **PROFILE** - User profile setup (optional)
7. **COMPLETE** - Onboarding complete

## Theme Integration

All components use the theme system defined in `src/theme.js`:
- Colors (brand, primary, secondary, neutrals, status)
- Typography scales
- Spacing system
- Shadows and radii
- Transitions and animations

## Key Features

### Location Detection
- Uses browser Geolocation API
- Falls back to manual entry if denied
- Reverse geocoding (mock implementation - replace with real service)

### Address Autocomplete
- Mock implementation with sample data
- In production, integrate with:
  - Google Places API
  - Mapbox Geocoding API
  - Or similar service

### Map Integration
- Uses React Leaflet for interactive maps
- Draggable pin for precise location selection
- OpenStreetMap tiles (free, no API key required)

### Validation
- Address validation (street, suburb, city required)
- Coordinate validation
- Email and mobile validation (when provided)

## Production Considerations

### To Make Production-Ready:

1. **Geocoding Service**
   - Replace mock geocoding with real service (Google Maps, Mapbox, etc.)
   - Add API key management
   - Handle rate limiting

2. **Address Autocomplete**
   - Integrate with Google Places Autocomplete or similar
   - Add debouncing for search queries
   - Cache popular searches

3. **Database**
   - Replace in-memory storage with real database
   - Add indexes for location queries
   - Implement service area boundaries

4. **Authentication**
   - Add user authentication
   - Link addresses to authenticated users
   - Secure API endpoints

5. **Error Handling**
   - Better error messages
   - Retry logic for failed requests
   - Offline support

6. **Performance**
   - Lazy load map components
   - Optimize images and assets
   - Add loading states

## Testing the Flow

1. Start both backend and frontend servers
2. Open `http://localhost:3000`
3. You'll see the Welcome screen
4. Click "Continue" to start onboarding
5. Test location permission (allow/deny)
6. Try manual address entry
7. Confirm address on map
8. Complete profile (or skip)
9. See the home screen with location badge

## File Structure

```
front-end/src/
├── components/
│   ├── onboarding/
│   │   ├── WelcomeScreen.jsx
│   │   ├── PermissionRequestScreen.jsx
│   │   ├── LocationDetectingScreen.jsx
│   │   ├── ManualAddressEntry.jsx
│   │   ├── AddressConfirmationScreen.jsx
│   │   ├── UserProfileSetup.jsx
│   │   ├── OnboardingFlow.jsx
│   │   └── index.js
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Map.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── index.js
│   └── HomeScreen.jsx
├── theme.js
└── App.jsx

back-end/
├── models/
│   ├── User.js
│   ├── Address.js
│   └── BaseModel.js
├── services/
│   ├── UserService.js
│   └── AddressService.js
├── controllers/
│   ├── UserController.js
│   └── AddressController.js
└── routes/
    ├── userRoutes.js
    └── addressRoutes.js
```

## Next Steps

1. Integrate real geocoding service
2. Add authentication
3. Connect to database
4. Add more validation
5. Implement service area checking
6. Add analytics tracking
7. Improve error handling
8. Add unit tests











