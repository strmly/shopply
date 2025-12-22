import Return from '../models/Return.js';
import CheckoutService from './CheckoutService.js';
import { ProductService } from './ProductService.js';

/**
 * Returns Service
 * Handles return and refund requests, status tracking, and refund processing
 */
class ReturnsService {
  constructor() {
    this.returns = new Map(); // In-memory storage for returns
    this.productCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached product or fetch and cache it
   */
  async getCachedProduct(productId) {
    const cached = this.productCache.get(productId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const product = await ProductService.getProductById(productId);
      if (product) {
        this.productCache.set(productId, {
          data: product,
          timestamp: Date.now(),
        });
      }
      return product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Check if order is eligible for return
   */
  isOrderEligibleForReturn(order) {
    if (!order) return { eligible: false, reason: 'Order not found' };
    
    if (order.status !== 'delivered') {
      return { eligible: false, reason: 'Returns can only be requested for delivered orders' };
    }

    // Check if order was delivered within return window (30 days)
    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
    const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    const returnWindowDays = 30;

    if (daysSinceDelivery > returnWindowDays) {
      return { 
        eligible: false, 
        reason: `Return window has expired. Returns must be requested within ${returnWindowDays} days of delivery.` 
      };
    }

    // Check if there's already a return for this order item
    const existingReturns = Array.from(this.returns.values())
      .filter(r => r.orderId === order.id && r.status !== 'cancelled' && r.status !== 'rejected');
    
    if (existingReturns.length > 0) {
      return { eligible: false, reason: 'A return request already exists for this order' };
    }

    return { eligible: true };
  }

  /**
   * Create a new return request
   */
  async createReturn(userId, orderId, returnData) {
    try {
      // Validate order exists and belongs to user
      const order = CheckoutService.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized: Order does not belong to user');
      }

      // Check eligibility
      const eligibility = this.isOrderEligibleForReturn(order);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      // Find the item in the order
      const item = order.items.find(i => 
        i.productId === returnData.productId || i.id === returnData.itemId
      );

      if (!item) {
        throw new Error('Item not found in order');
      }

      // Validate return quantity
      const requestedQuantity = returnData.quantity || item.quantity || 1;
      if (requestedQuantity > item.quantity) {
        throw new Error(`Cannot return more items than ordered. Ordered: ${item.quantity}, Requested: ${requestedQuantity}`);
      }

      // Get product details
      const product = await this.getCachedProduct(item.productId);

      // Create return
      const returnRequest = new Return({
        orderId,
        userId,
        itemId: item.id || item.productId,
        productId: item.productId,
        productName: product?.name || item.name || 'Product',
        productImage: product?.images?.[0] || product?.image || item.image || null,
        storeId: item.storeId || order.storeGroups?.[0]?.storeId,
        storeName: item.storeName || order.storeGroups?.[0]?.storeName || 'Store',
        reason: returnData.reason,
        reasonDescription: returnData.reasonDescription || null,
        quantity: returnData.quantity || item.quantity || 1,
        itemPrice: item.price || item.total || 0,
        refundDeliveryFee: returnData.refundDeliveryFee || false,
        refundMethod: returnData.refundMethod || 'original_payment',
        refundDestination: returnData.refundDestination || order.paymentMethod,
      });

      // Calculate refund amount
      returnRequest.calculateRefundAmount(order.totals);

      // Validate return
      const validation = returnRequest.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Store return first
      this.returns.set(returnRequest.id, returnRequest);

      // Auto-approve for demo purposes (in production, seller would approve)
      // Simulate approval after 2 seconds to show pending state
      setTimeout(() => {
        try {
          this.approveReturn(returnRequest.id, 'auto-approved');
        } catch (error) {
          console.error('Error auto-approving return:', error);
        }
      }, 2000);

      return returnRequest;
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  }

  /**
   * Get user returns with filtering
   */
  getUserReturns(userId, filter = 'all', options = {}) {
    try {
      let userReturns = Array.from(this.returns.values())
        .filter(r => r.userId === userId);

      // Filter by status
      if (filter === 'active') {
        const activeStatuses = ['pending', 'approved', 'processing', 'item_received', 'refund_processing'];
        userReturns = userReturns.filter(r => activeStatuses.includes(r.status));
      } else if (filter === 'completed') {
        userReturns = userReturns.filter(r => r.status === 'completed');
      } else if (filter === 'cancelled') {
        userReturns = userReturns.filter(r => r.status === 'cancelled' || r.status === 'rejected');
      }

      // Sort by most recent first
      userReturns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReturns = userReturns.slice(startIndex, endIndex);

      return {
        returns: paginatedReturns.map(r => r.toJSON()),
        pagination: {
          page,
          limit,
          total: userReturns.length,
          totalPages: Math.ceil(userReturns.length / limit),
          hasMore: endIndex < userReturns.length,
        },
      };
    } catch (error) {
      console.error('Error getting user returns:', error);
      throw new Error(`Failed to retrieve returns: ${error.message}`);
    }
  }

  /**
   * Get return by ID
   */
  getReturnById(returnId, userId = null) {
    const returnRequest = this.returns.get(returnId);
    
    if (!returnRequest) {
      return null;
    }

    // Check ownership if userId provided
    if (userId && returnRequest.userId !== userId) {
      return null;
    }

    return returnRequest;
  }

  /**
   * Get return summary for quick action card
   */
  getReturnSummary(userId) {
    try {
      const allReturns = Array.from(this.returns.values())
        .filter(r => r.userId === userId);

      const activeReturns = allReturns.filter(r => {
        const activeStatuses = ['pending', 'approved', 'processing', 'item_received', 'refund_processing'];
        return activeStatuses.includes(r.status);
      });

      const actionRequired = allReturns.filter(r => r.actionRequired);
      const completedReturns = allReturns.filter(r => r.status === 'completed');

      // Get most recent completed return
      const mostRecentCompleted = completedReturns.length > 0
        ? completedReturns.sort((a, b) => new Date(b.refundedAt || b.updatedAt) - new Date(a.refundedAt || a.updatedAt))[0]
        : null;

      // Generate subtext
      let subtext = 'View return history';
      if (actionRequired.length > 0) {
        subtext = `${actionRequired.length} return${actionRequired.length > 1 ? 's' : ''} needs attention`;
      } else if (activeReturns.length > 0) {
        subtext = `${activeReturns.length} return${activeReturns.length > 1 ? 's' : ''} in progress`;
      } else if (mostRecentCompleted) {
        const refundedAt = new Date(mostRecentCompleted.refundedAt || mostRecentCompleted.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - refundedAt) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          subtext = 'Refund completed today';
        } else if (daysDiff === 1) {
          subtext = 'Refund completed yesterday';
        } else {
          subtext = `Refund completed ${daysDiff} days ago`;
        }
      }

      // Determine badge status
      let badgeStatus = null;
      if (actionRequired.length > 0) {
        badgeStatus = { color: 'red', text: 'Action required' };
      } else if (activeReturns.length > 0) {
        badgeStatus = { color: 'yellow', text: 'Pending' };
      } else if (completedReturns.length > 0) {
        badgeStatus = { color: 'green', text: 'Completed' };
      }

      return {
        totalReturns: allReturns.length,
        activeCount: activeReturns.length,
        actionRequiredCount: actionRequired.length,
        completedCount: completedReturns.length,
        subtext,
        badgeStatus,
        hasIssue: actionRequired.length > 0,
      };
    } catch (error) {
      console.error('Error getting return summary:', error);
      return {
        totalReturns: 0,
        activeCount: 0,
        actionRequiredCount: 0,
        completedCount: 0,
        subtext: 'No returns yet',
        badgeStatus: null,
        hasIssue: false,
      };
    }
  }

  /**
   * Approve return (seller action)
   */
  approveReturn(returnId, approvedBy = 'system') {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    if (returnRequest.status !== 'pending') {
      throw new Error(`Cannot approve return with status: ${returnRequest.status}`);
    }

    returnRequest.updateStatus('approved', 'Return approved by seller');
    returnRequest.sellerApprovedAt = new Date();

    // Schedule pickup if required
    if (returnRequest.pickupRequired) {
      // In production, this would schedule with a courier service
      returnRequest.pickupScheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      
      // Simulate pickup completion after 2 days
      setTimeout(() => {
        try {
          this.markItemReceived(returnId);
        } catch (error) {
          console.error('Error marking item as received:', error);
        }
      }, 2 * 24 * 60 * 60 * 1000);
    } else {
      // No pickup required, mark as received immediately
      returnRequest.updateStatus('item_received', 'Item received (no pickup required)');
      returnRequest.itemReceivedAt = new Date();
      
      // Start refund processing after a short delay
      setTimeout(() => {
        try {
          this.startRefundProcessing(returnId);
        } catch (error) {
          console.error('Error starting refund processing:', error);
        }
      }, 2000);
    }

    return returnRequest;
  }

  /**
   * Reject return (seller action)
   */
  rejectReturn(returnId, reason, rejectedBy = 'system') {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    if (returnRequest.status !== 'pending') {
      throw new Error(`Cannot reject return with status: ${returnRequest.status}`);
    }

    returnRequest.updateStatus('rejected', `Return rejected: ${reason}`);
    returnRequest.sellerRejectedAt = new Date();
    returnRequest.rejectionReason = reason;

    return returnRequest;
  }

  /**
   * Mark item as received
   */
  markItemReceived(returnId) {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    if (returnRequest.status !== 'approved' && returnRequest.status !== 'processing') {
      throw new Error(`Cannot mark item as received with status: ${returnRequest.status}`);
    }

    returnRequest.updateStatus('item_received', 'Item received by seller');
    returnRequest.itemReceivedAt = new Date();
    returnRequest.pickupCompletedAt = new Date();

    // Start refund processing after item is received
    setTimeout(() => {
      this.startRefundProcessing(returnId);
    }, 2000);

    return returnRequest;
  }

  /**
   * Start refund processing
   */
  startRefundProcessing(returnId) {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    if (!['item_received', 'approved'].includes(returnRequest.status)) {
      throw new Error(`Cannot start refund processing with status: ${returnRequest.status}`);
    }

    returnRequest.updateStatus('refund_processing', 'Refund processing');
    returnRequest.expectedRefundDate = returnRequest.getExpectedRefundDate();

    // Simulate refund completion after delay
    // For demo: faster processing (30 seconds for wallet, 2 minutes for card)
    // In production: 1 day for wallet, 3-5 business days for card
    const delay = returnRequest.refundMethod === 'wallet' 
      ? 30 * 1000  // 30 seconds for demo
      : 2 * 60 * 1000; // 2 minutes for demo
    
    setTimeout(() => {
      try {
        this.completeRefund(returnId);
      } catch (error) {
        console.error('Error completing refund:', error);
      }
    }, delay);

    return returnRequest;
  }

  /**
   * Complete refund
   */
  completeRefund(returnId) {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    returnRequest.updateStatus('completed', 'Refund completed');
    returnRequest.refundedAt = new Date();
    returnRequest.refundTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    returnRequest.expectedRefundDate = null;

    return returnRequest;
  }

  /**
   * Cancel return
   */
  cancelReturn(returnId, userId) {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      throw new Error('Return not found');
    }

    if (returnRequest.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (!['pending', 'approved'].includes(returnRequest.status)) {
      throw new Error(`Cannot cancel return with status: ${returnRequest.status}`);
    }

    returnRequest.updateStatus('cancelled', 'Return cancelled by user');

    return returnRequest;
  }

  /**
   * Get return timeline
   */
  getReturnTimeline(returnId) {
    const returnRequest = this.returns.get(returnId);
    if (!returnRequest) {
      return null;
    }

    return returnRequest.getTimelineSteps();
  }
}

// Export singleton instance
export default new ReturnsService();

