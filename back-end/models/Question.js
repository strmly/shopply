class Question {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || 'default';
    this.userName = data.userName || 'Anonymous';
    this.userAvatar = data.userAvatar || null;
    this.userLocation = data.userLocation || null;
    this.productId = data.productId || null;
    this.storeId = data.storeId || null;
    this.question = data.question || '';
    this.answers = data.answers || [];
    this.helpfulCount = data.helpfulCount || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userAvatar: this.userAvatar,
      userLocation: this.userLocation,
      productId: this.productId,
      storeId: this.storeId,
      question: this.question,
      answers: this.answers,
      helpfulCount: this.helpfulCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.question || this.question.trim().length === 0) {
      errors.push('Question is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Question;











