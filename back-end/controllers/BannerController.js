import { BannerService } from '../services/BannerService.js';

class BannerControllerClass {
  getBanners(req, res) {
    const { placement = 'home', limit = 3 } = req.query;
    let location = null;

    try {
      location = req.query.location ? JSON.parse(req.query.location) : null;
    } catch {
      location = null;
    }

    const banners = BannerService.getBanners({ placement, limit, location });
    res.json({
      success: true,
      data: banners,
      count: banners.length,
    });
  }

  recordImpression(req, res) {
    const banner = BannerService.record(req.params.id, 'impression');
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, data: banner.metrics });
  }

  recordClick(req, res) {
    const banner = BannerService.record(req.params.id, 'click');
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, data: banner.metrics });
  }

  dismiss(req, res) {
    const banner = BannerService.record(req.params.id, 'dismiss');
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, data: banner.metrics });
  }
}

export const BannerController = new BannerControllerClass();
