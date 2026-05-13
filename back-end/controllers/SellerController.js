import { SellerService } from '../services/SellerService.js';
import { ProductService } from '../services/ProductService.js';

/**
 * Seller Controller
 * Handles HTTP requests and responses for seller operations
 */
export class SellerController {
  /**
   * Get all sellers
   */
  async getAllSellers(req, res, next) {
    try {
      const sellers = await SellerService.getAllSellers();
      res.json({
        success: true,
        data: sellers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get seller by ID
   */
  async getSellerById(req, res, next) {
    try {
      const seller = await SellerService.getSellerById(req.params.id);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      res.json({
        success: true,
        data: seller,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get seller products
   */
  async getSellerProducts(req, res, next) {
    try {
      const { id } = req.params;
      const products = await ProductService.getProductsByStoreId(id);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new seller onboarding draft
   */
  async createOnboarding(req, res, next) {
    try {
      const seller = await SellerService.createOnboarding({
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        legalBusinessName: req.body.legalBusinessName,
        storeBasicInfo: req.body.storeBasicInfo,
        onboardingStep: req.body.onboardingStep || 1,
      });

      res.status(201).json({
        success: true,
        message: 'Seller onboarding session created successfully',
        data: seller,
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async getStoreHours(req, res, next) {
    try {
      const data = await SellerService.getStoreHours(req.params.id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStoreHours(req, res, next) {
    try {
      const data = await SellerService.updateStoreHours(req.params.id, req.body);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      res.json({
        success: true,
        message: 'Store hours updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public become-a-seller application.
   */
  async createBecomeSellerApplication(req, res, next) {
    try {
      const seller = await SellerService.createBecomeSellerApplication(req.body);

      res.status(201).json({
        success: true,
        message: 'Seller application created successfully',
        data: {
          seller,
          nextUrl: '/seller/onboarding',
          onboardingId: seller.id,
        },
      });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 409) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.message.split(', '),
        });
      }
      next(error);
    }
  }

  async getBecomeSellerStats(req, res, next) {
    try {
      const stats = await SellerService.getBecomeSellerStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSellerLearnMoreContent(req, res, next) {
    try {
      const content = await SellerService.getSellerLearnMoreContent();

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get onboarding data for a seller
   */
  async getOnboarding(req, res, next) {
    try {
      const seller = await SellerService.getOnboarding(req.params.id);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller onboarding session not found',
        });
      }

      res.json({
        success: true,
        data: seller,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Partially update seller onboarding data
   */
  async updateOnboarding(req, res, next) {
    try {
      const seller = await SellerService.updateOnboarding(req.params.id, req.body);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller onboarding session not found',
        });
      }

      res.json({
        success: true,
        message: 'Onboarding progress saved successfully',
        data: seller,
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Complete seller onboarding (submit for review)
   */
  async completeOnboarding(req, res, next) {
    try {
      const seller = await SellerService.completeOnboarding(req.params.id);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller onboarding session not found',
        });
      }

      res.json({
        success: true,
        message: 'Onboarding submitted successfully! Your store is now under review.',
        data: seller,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.message.split(', '),
        });
      }
      next(error);
    }
  }
}

