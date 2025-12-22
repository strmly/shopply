class Poll {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || 'default';
    this.userName = data.userName || 'Anonymous';
    this.userLocation = data.userLocation || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.options = data.options || []; // [{ text: 'Option 1', votes: 0 }]
    this.votes = data.votes || {}; // { userId: optionIndex }
    this.totalVotes = data.totalVotes || 0;
    this.expiresAt = data.expiresAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userLocation: this.userLocation,
      title: this.title,
      description: this.description,
      options: this.options,
      votes: this.votes,
      totalVotes: this.totalVotes,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Poll title is required');
    }

    if (!this.options || this.options.length < 2) {
      errors.push('Poll must have at least 2 options');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Poll;











