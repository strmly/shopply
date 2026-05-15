class AdminIssueServiceClass {
  constructor() {
    const now = Date.now();
    this.issues = [
      {
        id: 1,
        type: 'delivery',
        title: 'Delivery window needs confirmation',
        description: 'Demo order is out for delivery and should be monitored by support.',
        status: 'open',
        priority: 'medium',
        orderId: '12345',
        userId: 'default',
        sellerId: 1,
        createdAt: new Date(now - 35 * 60 * 1000),
        updatedAt: new Date(now - 35 * 60 * 1000),
      },
      {
        id: 2,
        type: 'product',
        title: 'Product listing missing dimensions',
        description: 'A furniture item has weak product detail quality.',
        status: 'triage',
        priority: 'low',
        productId: 1,
        sellerId: 1,
        createdAt: new Date(now - 3 * 60 * 60 * 1000),
        updatedAt: new Date(now - 3 * 60 * 60 * 1000),
      },
    ];
    this.nextId = 3;
  }

  list(filters = {}) {
    let rows = [...this.issues];
    if (filters.status && filters.status !== 'all') rows = rows.filter(issue => issue.status === filters.status);
    if (filters.priority && filters.priority !== 'all') rows = rows.filter(issue => issue.priority === filters.priority);
    return rows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  update(id, updates = {}) {
    const index = this.issues.findIndex(issue => String(issue.id) === String(id));
    if (index === -1) return null;
    this.issues[index] = {
      ...this.issues[index],
      ...updates,
      id: this.issues[index].id,
      updatedAt: new Date(),
    };
    return this.issues[index];
  }

  create(data = {}) {
    const issue = {
      id: this.nextId++,
      type: data.type || 'support',
      title: String(data.title || 'Admin issue').trim(),
      description: String(data.description || '').trim(),
      status: data.status || 'open',
      priority: data.priority || 'medium',
      orderId: data.orderId || null,
      userId: data.userId || null,
      sellerId: data.sellerId || null,
      productId: data.productId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.unshift(issue);
    return issue;
  }
}

export const AdminIssueService = new AdminIssueServiceClass();
