class AdminDeliveryMonitorServiceClass {
  constructor() {
    const now = Date.now();
    this.events = [
      {
        id: 1,
        channel: 'email',
        subject: 'Your Shopply verification code',
        recipient: 'admin@shopply.co.za',
        status: 'delivered',
        provider: 'smtp',
        attempts: 1,
        lastError: '',
        createdAt: new Date(now - 20 * 60 * 1000),
        updatedAt: new Date(now - 20 * 60 * 1000),
      },
      {
        id: 2,
        channel: 'sms',
        subject: 'Phone verification',
        recipient: '+27123456789',
        status: 'queued',
        provider: 'twilio-verify',
        attempts: 1,
        lastError: '',
        createdAt: new Date(now - 8 * 60 * 1000),
        updatedAt: new Date(now - 8 * 60 * 1000),
      },
    ];
    this.nextId = 3;
  }

  list() {
    return [...this.events].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  record(data = {}) {
    const event = {
      id: this.nextId++,
      channel: data.channel || 'email',
      subject: data.subject || 'Message',
      recipient: data.recipient || '',
      status: data.status || 'sent',
      provider: data.provider || 'system',
      attempts: Number(data.attempts || 1),
      lastError: data.lastError || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.events.unshift(event);
    return event;
  }

  retry(id) {
    const event = this.events.find(item => String(item.id) === String(id));
    if (!event) return null;
    event.attempts += 1;
    event.status = 'sent';
    event.lastError = '';
    event.updatedAt = new Date();
    return event;
  }
}

export const AdminDeliveryMonitorService = new AdminDeliveryMonitorServiceClass();
