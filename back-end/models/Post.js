class Post {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || 'default';
    this.userName = data.userName || 'Anonymous';
    this.userAvatar = data.userAvatar || null;
    this.userLocation = data.userLocation || null; // { lat, lng, suburb, distance }
    this.type = data.type || 'text'; // 'text', 'photo', 'recommendation', 'question', 'find'
    this.title = data.title || '';
    this.content = data.content || '';
    this.media = data.media || []; // photos, product previews
    this.linkedProducts = data.linkedProducts || []; // product IDs
    this.linkedStore = data.linkedStore || null; // store ID
    this.tags = data.tags || [];
    this.likeCount = data.likeCount || 0;
    this.commentCount = data.commentCount || 0;
    this.shareCount = data.shareCount || 0;
    this.viewCount = data.viewCount || 0;
    this.isTrending = data.isTrending || false;
    this.isPinned = data.isPinned || false;
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
      type: this.type,
      title: this.title,
      content: this.content,
      media: this.media,
      linkedProducts: this.linkedProducts,
      linkedStore: this.linkedStore,
      tags: this.tags,
      likeCount: this.likeCount,
      commentCount: this.commentCount,
      shareCount: this.shareCount,
      viewCount: this.viewCount,
      isTrending: this.isTrending,
      isPinned: this.isPinned,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Post content is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Post;











