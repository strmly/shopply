import { ProductService } from '../services/ProductService.js';
import { SellerService } from '../services/SellerService.js';
import { getStoreById } from '../services/StoreService.js';

const getPublicSeller = async (storeId, store) => {
  let seller = null;

  if (store?.sellerId) {
    seller = await SellerService.getSellerById(store.sellerId);
  }

  if (!seller && storeId) {
    seller = await SellerService.getSellerById(storeId);
  }

  if (!seller && parseInt(storeId, 10) === 1) {
    seller = await SellerService.seedDefaultSeller();
  }

  return seller;
};

const toProductJson = (product) => (
  product && typeof product.toJSON === 'function' ? product.toJSON() : product
);

export class StorefrontController {
  async getStorefront(req, res, next) {
    try {
      const { storeId } = req.params;
      const store = getStoreById(storeId) || getStoreById(parseInt(storeId, 10));
      const seller = await getPublicSeller(storeId, store);
      const products = (await ProductService.getProductsByStoreId(storeId))
        .map(toProductJson)
        .filter(product => product?.isVisible !== false);

      if (!store && !seller && products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found',
        });
      }

      const firstProduct = products[0] || {};
      const storeName = store?.name
        || seller?.storeSetup?.name
        || firstProduct.storeName
        || 'Shopply Store';

      const address = store?.address
        || seller?.address
        || firstProduct.storeLocation
        || null;

      const phone = seller?.storeBasicInfo?.storePhone
        || seller?.phone
        || store?.phone
        || firstProduct.storePhone
        || '';

      const ratingValues = products
        .map(product => Number(product.rating))
        .filter(value => Number.isFinite(value) && value > 0);
      const averageProductRating = ratingValues.length
        ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length
        : null;

      const storeData = {
        id: store?.id || parseInt(storeId, 10) || storeId,
        sellerId: seller?.id || store?.sellerId || parseInt(storeId, 10) || null,
        name: storeName,
        logo: store?.logo || seller?.storeSetup?.logo || null,
        description: store?.description
          || seller?.storeSetup?.description
          || `${storeName} sells curated furniture and home pieces on Shopply.`,
        address,
        phone,
        whatsappNumber: phone,
        email: seller?.storeBasicInfo?.contactEmail || seller?.email || store?.email || '',
        hours: seller?.storeSetup?.hours || store?.hours || null,
        rating: store?.rating || seller?.rating || averageProductRating || 4.8,
        reviewCount: store?.reviewCount || seller?.reviewCount || products.reduce((sum, product) => sum + (product.reviewCount || 0), 0),
        storeType: store?.storeType || seller?.storeBasicInfo?.storeType || 'retailer',
        deliveryModes: store?.deliveryModes || ['pickup', 'local_delivery'],
        verificationStatus: store?.verificationStatus || (seller?.kycVerified ? 'verified' : 'verified_partner'),
        pickupAvailable: seller?.policies?.pickupAvailable ?? true,
        responseMinutes: seller?.responseStats?.avgResponseMinutes || 30,
      };

      res.json({
        success: true,
        data: {
          store: storeData,
          products,
          stats: {
            productCount: products.length,
            inStockCount: products.filter(product => product.stock !== 'out').length,
            averageRating: storeData.rating,
            reviewCount: storeData.reviewCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
