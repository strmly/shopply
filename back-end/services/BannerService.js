class BannerServiceClass {
  constructor() {
    this.metrics = new Map();
    this.banners = [
      {
        id: 'home-room-refresh',
        placements: ['home'],
        eyebrow: 'Local room edit',
        title: 'Refresh a room with pieces available nearby',
        body: 'Shop sofas, storage, tables, and finishing touches from sellers close to your delivery area.',
        cta: 'Shop rooms',
        ctaRoute: '/search',
        accent: 'primary',
        priority: 100,
        badge: 'Nearby stock',
      },
      {
        id: 'home-flash-deals',
        placements: ['home', 'search'],
        eyebrow: 'Limited time',
        title: 'Flash deals worth checking before they move',
        body: 'A curated feed of marked-down furniture with live local availability.',
        cta: 'View deals',
        ctaRoute: '/deals',
        accent: 'warm',
        priority: 92,
        badge: 'Live deals',
      },
      {
        id: 'home-bundles',
        placements: ['home', 'cart'],
        eyebrow: 'Curated bundles',
        title: 'Complete the room without hunting around',
        body: 'Bundle complementary pieces from nearby stores and keep your checkout simple.',
        cta: 'Explore bundles',
        ctaRoute: '/bundles',
        accent: 'fresh',
        priority: 86,
        badge: 'Room ready',
      },
      {
        id: 'search-nearby',
        placements: ['search'],
        eyebrow: 'Search smarter',
        title: 'Filter by room, stock, delivery, and distance',
        body: 'Find refined furniture faster with local results that match how you actually shop.',
        cta: 'Browse all',
        ctaRoute: '/search',
        accent: 'primary',
        priority: 95,
        badge: 'Refined search',
      },
      {
        id: 'cart-checkout',
        placements: ['cart'],
        eyebrow: 'Ready when you are',
        title: 'Checkout sends your order straight to the seller',
        body: 'No payment gateway for now. We prepare the WhatsApp order message so you can confirm directly.',
        cta: 'Checkout',
        ctaRoute: '/checkout',
        accent: 'primary',
        priority: 98,
        badge: 'WhatsApp order',
      },
      {
        id: 'cart-vouchers',
        placements: ['cart'],
        eyebrow: 'Rewards',
        title: 'Use vouchers before placing your order',
        body: 'Apply available rewards in your cart and keep the final order message clean.',
        cta: 'My vouchers',
        ctaRoute: '/vouchers',
        accent: 'warm',
        priority: 80,
        badge: 'Wallet',
      },
    ];
  }

  _metricFor(id) {
    if (!this.metrics.has(id)) {
      this.metrics.set(id, { impressions: 0, clicks: 0, dismissed: 0 });
    }
    return this.metrics.get(id);
  }

  getBanners({ placement = 'home', limit = 3, location = null } = {}) {
    const locLabel = location?.suburb || location?.city || 'your area';
    return this.banners
      .filter(banner => banner.placements.includes(placement))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Number(limit) || 3)
      .map(banner => ({
        ...banner,
        locationLabel: locLabel,
        metrics: this._metricFor(banner.id),
      }));
  }

  record(id, type) {
    const banner = this.banners.find(item => item.id === id);
    if (!banner) return null;
    const metrics = this._metricFor(id);
    if (type === 'click') metrics.clicks += 1;
    if (type === 'impression') metrics.impressions += 1;
    if (type === 'dismiss') metrics.dismissed += 1;
    return { ...banner, metrics };
  }
}

export const BannerService = new BannerServiceClass();
