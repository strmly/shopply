import { BaseModel } from './BaseModel.js';

/**
 * Return Model
 * Represents a return/refund request for an order item
 */
export class Return extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.orderId = data.orderId || null;
    this.userId = data.userId || null;
    this.itemId = data.itemId || null; // Reference to order item
    this.productId = data.productId || null;
    this.productName = data.productName || '';
    this.productImage = data.productImage || null;
    this.storeId = data.storeId || null;
    this.storeName = data.storeName || '';
    
    // Return details
    this.reason = data.reason || null; // 'damaged', 'wrong_item', 'defective', 'not_as_described', 'changed_mind', 'other'
    this.reasonDescription = data.reasonDescription || null; // Additional details
    this.quantity = data.quantity || 1;
    this.itemPrice = data.itemPrice || 0; // Price at time of purchase
    this.refundAmount = data.refundAmount || 0; // Calculated refund amount
    this.refundDeliveryFee = data.refundDeliveryFee !== undefined ? data.refundDeliveryFee : false; // Whether to refund delivery fee
    
    // Status tracking
    this.status = data.status || 'pending'; // 'pending', 'approved', 'rejected', 'processing', 'item_received', 'refund_processing', 'completed', 'cancelled'
    this.statusHistory = data.statusHistory || [];
    
    // Refund details
    this.refundMethod = data.refundMethod || null; // 'original_payment', 'wallet', 'store_credit'
    this.refundDestination = data.refundDestination || null; // Payment method details
    this.expectedRefundDate = data.expectedRefundDate || null;
    this.refundedAt = data.refundedAt || null;
    this.refundTransactionId = data.refundTransactionId || null;
    
    // Seller/courier interaction
    this.sellerApprovedAt = data.sellerApprovedAt || null;
    this.sellerRejectedAt = data.sellerRejectedAt || null;
    this.rejectionReason = data.rejectionReason || null;
    this.pickupRequired = data.pickupRequired !== undefined ? data.pickupRequired : true;
    this.pickupScheduledAt = data.pickupScheduledAt || null;
    this.pickupCompletedAt = data.pickupCompletedAt || null;
    this.itemReceivedAt = data.itemReceivedAt || null;
    
    // Action required flags
    this.actionRequired = data.actionRequired || false;
    this.actionRequiredReason = data.actionRequiredReason || null;
    this.actionRequiredMessage = data.actionRequiredMessage || null;
    
    // Timestamps
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Initialize status history
    if (this.statusHistory.length === 0) {
      this.statusHistory.push({
        status: 'pending',
        timestamp: this.createdAt,
        message: 'Return requested',
      });
    }
  }

  validate() {
    const errors = [];

    if (!this.orderId) {
      errors.push('Order ID is required');
    }

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.itemId && !this.productId) {
      errors.push('Item ID or Product ID is required');
    }

    if (!this.reason) {
      errors.push('Return reason is required');
    }

    const validReasons = ['damaged', 'wrong_item', 'defective', 'not_as_described', 'changed_mind', 'other'];
    if (this.reason && !validReasons.includes(this.reason)) {
      errors.push(`Invalid return reason. Must be one of: ${validReasons.join(', ')}`);
    }

    if (this.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (this.itemPrice < 0) {
      errors.push('Item price cannot be negative');
    }

    if (this.refundAmount < 0) {
      errors.push('Refund amount cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update status and add to history
   */
  updateStatus(newStatus, message = null) {
    const previousStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date();

    // Add to status history
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      message: message || this.getStatusMessage(newStatus),
      previousStatus,
    });

    // Update action required flags
    this.updateActionRequired();
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(status) {
    const messages = {
      pending: 'Return requested',
      approved: 'Return approved by seller',
      rejected: 'Return rejected',
      processing: 'Return being processed',
      item_received: 'Item received by seller',
      refund_processing: 'Refund processing',
      completed: 'Refund completed',
      cancelled: 'Return cancelled',
    };
    return messages[status] || 'Status updated';
  }

  /**
   * Update action required flags based on current status
   */
  updateActionRequired() {
    if (this.status === 'rejected' || this.status === 'cancelled') {
      this.actionRequired = false;
      return;
    }

    // Check if action is required
    if (this.status === 'pending' && !this.sellerApprovedAt && !this.sellerRejectedAt) {
      // Waiting for seller approval - no action needed from user yet
      this.actionRequired = false;
    } else if (this.status === 'approved' && this.pickupRequired && !this.pickupCompletedAt) {
      // Pickup scheduled but not completed
      this.actionRequired = true;
      this.actionRequiredReason = 'pickup_missed';
      this.actionRequiredMessage = 'Courier pickup missed. Please reschedule.';
    } else if (this.actionRequiredReason === 'missing_info' && !this.reasonDescription) {
      this.actionRequired = true;
      this.actionRequiredMessage = 'Additional information required';
    } else {
      this.actionRequired = false;
    }
  }

  /**
   * Calculate refund amount
   */
  calculateRefundAmount(orderTotals = null) {
    let amount = this.itemPrice * this.quantity;

    // Add delivery fee if applicable
    if (this.refundDeliveryFee && orderTotals) {
      // Only refund delivery fee if this is the only return for the order
      // In a real system, you'd check if there are other non-returned items
      amount += orderTotals.deliveryFee || 0;
    }

    this.refundAmount = Math.max(0, amount);
    return this.refundAmount;
  }

  /**
   * Get expected refund date based on status
   */
  getExpectedRefundDate() {
    if (this.status === 'completed' && this.refundedAt) {
      return null; // Already refunded
    }

    if (this.status === 'refund_processing' || this.status === 'item_received') {
      // Refunds typically take 3-5 business days
      const days = this.refundMethod === 'wallet' ? 1 : 5;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + days);
      return expectedDate;
    }

    return null;
  }

  /**
   * Get timeline steps with detailed descriptions
   */
  getTimelineSteps() {
    const steps = [
      {
        id: 'requested',
        label: 'Return requested',
        description: 'Your return request has been submitted',
        status: 'completed',
        timestamp: this.createdAt,
      },
    ];

    // Approval or rejection
    if (this.sellerApprovedAt) {
      steps.push({
        id: 'approved',
        label: 'Seller approved',
        description: 'Your return has been approved by the seller',
        status: 'completed',
        timestamp: this.sellerApprovedAt,
      });
    } else if (this.sellerRejectedAt) {
      steps.push({
        id: 'rejected',
        label: 'Return rejected',
        description: this.rejectionReason || 'Return request was rejected',
        status: 'error',
        timestamp: this.sellerRejectedAt,
      });
      return steps; // Stop here if rejected
    } else if (this.status === 'pending') {
      steps.push({
        id: 'approved',
        label: 'Seller approval',
        description: 'Waiting for seller to review your return request',
        status: 'current',
        timestamp: null,
      });
    }

    // Item pickup/receipt
    if (this.pickupRequired) {
      if (this.pickupCompletedAt) {
        steps.push({
          id: 'pickup',
          label: 'Item picked up',
          description: 'Courier has collected the item',
          status: 'completed',
          timestamp: this.pickupCompletedAt,
        });
      } else if (this.status === 'approved' && this.pickupScheduledAt) {
        steps.push({
          id: 'pickup',
          label: 'Pickup scheduled',
          description: `Scheduled for ${new Date(this.pickupScheduledAt).toLocaleDateString()}`,
          status: 'current',
          timestamp: null,
        });
      }
    }

    // Item received
    if (this.itemReceivedAt) {
      steps.push({
        id: 'received',
        label: 'Item received',
        description: 'Seller has received and verified the returned item',
        status: 'completed',
        timestamp: this.itemReceivedAt,
      });
    } else if (this.status === 'item_received' || (this.status === 'refund_processing' && !this.itemReceivedAt)) {
      steps.push({
        id: 'received',
        label: 'Item received',
        description: 'Seller is verifying the returned item',
        status: 'current',
        timestamp: null,
      });
    }

    // Refund processing
    if (this.status === 'refund_processing') {
      steps.push({
        id: 'refund_processing',
        label: 'Refund processing',
        description: `Refunding ${this.refundAmount.toFixed(2)} to your ${this.refundMethod === 'wallet' ? 'wallet' : 'payment method'}`,
        status: 'current',
        timestamp: null,
      });
    } else if (this.status === 'completed') {
      steps.push({
        id: 'refund_processing',
        label: 'Refund processing',
        description: 'Refund was processed',
        status: 'completed',
        timestamp: this.refundedAt || this.updatedAt,
      });
    }

    // Completed
    if (this.status === 'completed') {
      steps.push({
        id: 'completed',
        label: 'Refund completed',
        description: `R${this.refundAmount.toFixed(2)} has been refunded to your ${this.refundMethod === 'wallet' ? 'wallet' : 'payment method'}`,
        status: 'completed',
        timestamp: this.refundedAt || this.updatedAt,
      });
    } else if (this.status === 'refund_processing') {
      steps.push({
        id: 'completed',
        label: 'Refund completed',
        description: 'Refund will be completed soon',
        status: 'pending',
        timestamp: null,
      });
    }

    return steps;
  }

  /**
   * Get human-readable reason
   */
  getReasonLabel() {
    const labels = {
      damaged: 'Damaged item',
      wrong_item: 'Wrong item delivered',
      defective: 'Defective item',
      not_as_described: 'Not as described',
      changed_mind: 'Changed mind',
      other: 'Other',
    };
    return labels[this.reason] || this.reason;
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      userId: this.userId,
      itemId: this.itemId,
      productId: this.productId,
      productName: this.productName,
      productImage: this.productImage,
      storeId: this.storeId,
      storeName: this.storeName,
      reason: this.reason,
      reasonDescription: this.reasonDescription,
      quantity: this.quantity,
      itemPrice: this.itemPrice,
      refundAmount: this.refundAmount,
      refundDeliveryFee: this.refundDeliveryFee,
      status: this.status,
      statusHistory: this.statusHistory,
      refundMethod: this.refundMethod,
      refundDestination: this.refundDestination,
      expectedRefundDate: this.expectedRefundDate,
      refundedAt: this.refundedAt,
      refundTransactionId: this.refundTransactionId,
      sellerApprovedAt: this.sellerApprovedAt,
      sellerRejectedAt: this.sellerRejectedAt,
      rejectionReason: this.rejectionReason,
      pickupRequired: this.pickupRequired,
      pickupScheduledAt: this.pickupScheduledAt,
      pickupCompletedAt: this.pickupCompletedAt,
      itemReceivedAt: this.itemReceivedAt,
      actionRequired: this.actionRequired,
      actionRequiredReason: this.actionRequiredReason,
      actionRequiredMessage: this.actionRequiredMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Return;

