/**
 * Onboarding Skill
 * Handles new user onboarding and location setup
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import whatsappMessageRenderer from '../WhatsAppMessageRenderer.js';
import { UserService } from '../../services/UserService.js';
import { AddressService } from '../../services/AddressService.js';

class OnboardingSkill extends BaseSkill {
  constructor() {
    super('OnboardingSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;
    const { type, payload, userChannelId, userName } = channelEvent;

    switch (step) {
      case 'WELCOME':
        return this.handleWelcome(userChannelId, userName);
      
      case 'LOCATION_CHOICE':
        return this.handleLocationChoice(channelEvent, session);
      
      case 'LOCATION_INPUT':
        return this.handleLocationInput(channelEvent, session);
      
      case 'CONFIRM_LOCATION':
        return this.handleConfirmLocation(channelEvent, session);
      
      case 'SELECT_RADIUS':
        return this.handleRadiusSelection(channelEvent, session);
      
      case 'COMPLETE':
        return this.completeOnboarding(channelEvent, session);
      
      default:
        return this.handleWelcome(userChannelId, userName);
    }
  }

  /**
   * Welcome message
   */
  async handleWelcome(phoneNumber, userName) {
    // Check if user already exists
    const existingUser = await whatsappSessionService.getLinkedUser(phoneNumber);
    
    if (existingUser) {
      // User exists, go straight to home
      await whatsappSessionService.changeFlow(phoneNumber, 'BUYER_HOME', 'INITIAL');
      return this.textResponse(
        `Welcome back${userName ? `, ${userName}` : ''}! 👋\n\nWhat would you like to do today?`
      );
    }

    // New user
    await whatsappSessionService.changeFlow(phoneNumber, 'ONBOARDING', 'LOCATION_CHOICE');
    
    return await whatsappMessageRenderer.sendWelcome(phoneNumber, userName);
  }

  /**
   * Location choice
   */
  async handleLocationChoice(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'set_location') {
      await this.changeFlow(userChannelId, 'ONBOARDING', 'LOCATION_INPUT');
      
      return this.buttonsResponse(
        '📍 *Set Your Location*\n\nWe need your location to show you products from nearby sellers.\n\nHow would you like to share your location?',
        [
          { id: 'share_location', title: '📲 Share Location' },
          { id: 'enter_address', title: '✏️ Enter Address' },
        ]
      );
    }

    if (id === 'browse') {
      // Skip location for now, use default
      await this.completeOnboardingWithDefault(userChannelId);
      await this.changeFlow(userChannelId, 'BUYER_HOME', 'INITIAL');
      
      const BuyerHomeSkill = (await import('./BuyerHomeSkill.js')).default;
      return BuyerHomeSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    return this.handleWelcome(userChannelId, eventChannel.userName);
  }

  /**
   * Location input
   */
  async handleLocationInput(channelEvent, session) {
    const { type, payload, userChannelId } = channelEvent;
    const id = this.getId(channelEvent);

    if (id === 'share_location') {
      return this.locationRequestResponse(
        '📍 Please share your location using the button below.\n\nThis helps us find sellers near you!'
      );
    }

    if (id === 'enter_address') {
      await this.changeFlow(userChannelId, 'ONBOARDING', 'LOCATION_INPUT', { method: 'text' });
      return this.textResponse(
        '✏️ Please type your address or suburb.\n\nFor example: "Sandton, Johannesburg" or "123 Main St, Cape Town"'
      );
    }

    // Handle location share
    if (type === 'location') {
      const { latitude, longitude, name, address } = payload;
      
      await this.updateContext(userChannelId, {
        location: { latitude, longitude, name, address },
      });

      await this.changeFlow(userChannelId, 'ONBOARDING', 'CONFIRM_LOCATION');
      
      return this.buttonsResponse(
        `📍 *Location Received*\n\n${name || address || 'Your location'}\n\nIs this correct?`,
        [
          { id: 'confirm_location', title: '✅ Yes, Correct' },
          { id: 'change_location', title: '✏️ Change' },
        ]
      );
    }

    // Handle text address
    if (type === 'text' && session.context.method === 'text') {
      const addressText = this.getText(channelEvent);
      
      // In production, geocode this address
      // For now, mock it
      const mockLocation = {
        address: addressText,
        latitude: -26.2041,
        longitude: 28.0473,
        suburb: addressText,
      };

      await this.updateContext(userChannelId, { location: mockLocation });
      await this.changeFlow(userChannelId, 'ONBOARDING', 'CONFIRM_LOCATION');
      
      return this.buttonsResponse(
        `📍 *Location Set*\n\n${addressText}\n\nIs this correct?`,
        [
          { id: 'confirm_location', title: '✅ Yes, Correct' },
          { id: 'change_location', title: '✏️ Change' },
        ]
      );
    }

    return this.textResponse('Please share your location or enter your address.');
  }

  /**
   * Confirm location
   */
  async handleConfirmLocation(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'confirm_location') {
      await this.changeFlow(userChannelId, 'ONBOARDING', 'SELECT_RADIUS');
      
      return this.buttonsResponse(
        '🎯 *Search Radius*\n\nHow far should we search for products?\n\n*Auto* (recommended): We\'ll automatically expand if needed.',
        [
          { id: 'radius_auto', title: '🎯 Auto (Smart)' },
          { id: 'radius_custom', title: '📏 Custom' },
        ]
      );
    }

    if (id === 'change_location') {
      await this.changeFlow(userChannelId, 'ONBOARDING', 'LOCATION_INPUT');
      return this.handleLocationInput(channelEvent, session);
    }

    return this.textResponse('Please confirm your location.');
  }

  /**
   * Radius selection
   */
  async handleRadiusSelection(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'radius_auto') {
      await this.updateContext(userChannelId, { radiusMode: 'auto' });
      return this.completeOnboarding(channelEvent, session);
    }

    if (id === 'radius_custom') {
      return this.listResponse(
        'Select your preferred search radius:',
        'Choose Radius',
        [{
          title: 'Search Radius',
          rows: [
            { id: 'radius_1km', title: '1 km', description: 'Very local, may have fewer results' },
            { id: 'radius_5km', title: '5 km', description: 'Balanced results' },
            { id: 'radius_10km', title: '10 km', description: 'More options' },
            { id: 'radius_20km', title: '20 km', description: 'Maximum reach' },
          ],
        }]
      );
    }

    // Handle custom radius selection
    if (id.startsWith('radius_')) {
      const radius = id.replace('radius_', '');
      await this.updateContext(userChannelId, { radiusMode: 'fixed', radius });
      return this.completeOnboarding(channelEvent, session);
    }

    return this.textResponse('Please select a radius option.');
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const { location, radiusMode, radius } = session.context;

    try {
      // Create user account
      const userData = {
        phoneNumber: userChannelId,
        channel: 'whatsapp',
        preferences: {
          radiusMode: radiusMode || 'auto',
          radius: radius || null,
        },
      };

      // Link user in session
      await whatsappSessionService.linkUser(userChannelId, userData);

      // Save address if provided
      if (location) {
        await AddressService.createAddress({
          userId: userChannelId,
          ...location,
          isDefault: true,
        });
      }

      // Move to home
      await this.changeFlow(userChannelId, 'BUYER_HOME', 'INITIAL');

      return [
        this.textResponse('✅ All set! You\'re ready to shop! 🎉'),
        this.buttonsResponse(
          '🏠 *What would you like to do?*',
          [
            { id: 'search', title: '🔍 Search Products' },
            { id: 'browse_categories', title: '📂 Categories' },
            { id: 'deals', title: '🔥 Hot Deals' },
          ]
        ),
      ];
    } catch (error) {
      console.error('Onboarding completion error:', error);
      return this.textResponse('Something went wrong. Please try typing "home" to start over.');
    }
  }

  /**
   * Complete with default settings
   */
  async completeOnboardingWithDefault(phoneNumber) {
    const userData = {
      phoneNumber,
      channel: 'whatsapp',
      preferences: {
        radiusMode: 'auto',
      },
    };

    await whatsappSessionService.linkUser(phoneNumber, userData);
  }
}

export default new OnboardingSkill();

