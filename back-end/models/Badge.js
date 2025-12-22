class Badge {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.type = data.type || ''; // 'verified_buyer', 'top_reviewer', 'helpful_neighbor', etc.
    this.name = data.name || '';
    this.description = data.description || '';
    this.icon = data.icon || '🏅';
    this.color = data.color || '#007AFF';
    this.earnedAt = data.earnedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      name: this.name,
      description: this.description,
      icon: this.icon,
      color: this.color,
      earnedAt: this.earnedAt,
    };
  }
}

export default Badge;











