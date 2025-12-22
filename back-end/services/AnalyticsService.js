import SellerOrderService from './SellerOrderService.js';
import { ProductService } from './ProductService.js';
import { SellerService } from './SellerService.js';

/**
 * Analytics Service
 * Provides comprehensive analytics for sellers including sales heatmaps,
 * time-series data, product performance, and customer demographics
 * Enhanced with caching, better calculations, and sophisticated insights
 */
class AnalyticsServiceClass {
  constructor() {
    // Common Johannesburg suburbs for heatmap with coordinates
    this.suburbs = [
      'Sandton', 'Parkmore', 'Bryanston', 'Rosebank', 'Melrose',
      'Illovo', 'Houghton', 'Killarney', 'Randburg', 'Fourways',
      'Midrand', 'Centurion', 'Pretoria', 'Morningside', 'Rivonia'
    ];
    
    // Cache for analytics data (simple in-memory cache)
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Suburb coordinates for better heatmap visualization
    this.suburbCoordinates = {
      'Sandton': { lat: -26.1076, lng: 28.0567 },
      'Parkmore': { lat: -26.1000, lng: 28.0500 },
      'Bryanston': { lat: -26.0833, lng: 28.0333 },
      'Rosebank': { lat: -26.1467, lng: 28.0433 },
      'Melrose': { lat: -26.1333, lng: 28.0400 },
      'Illovo': { lat: -26.1200, lng: 28.0300 },
      'Houghton': { lat: -26.1667, lng: 28.0500 },
      'Killarney': { lat: -26.1500, lng: 28.0467 },
      'Randburg': { lat: -26.0944, lng: 28.0011 },
      'Fourways': { lat: -26.0167, lng: 28.0167 },
      'Midrand': { lat: -25.9833, lng: 28.1333 },
      'Centurion': { lat: -25.8603, lng: 28.1894 },
      'Pretoria': { lat: -25.7479, lng: 28.2293 },
      'Morningside': { lat: -26.1000, lng: 28.0600 },
      'Rivonia': { lat: -26.0500, lng: 28.0500 }
    };
  }
  
  /**
   * Get cached data or compute and cache
   */
  _getCached(key, computeFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const data = computeFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
  
  /**
   * Clear cache for a seller
   */
  clearCache(sellerId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`seller_${sellerId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get sales overview KPIs with enhanced calculations
   */
  async getSalesOverview(sellerId, period = '7d') {
    const cacheKey = `overview_${sellerId}_${period}`;
    
    return this._getCached(cacheKey, () => {
      const orders = this._getOrdersForPeriod(sellerId, period);
      const completedOrders = orders.filter(o => o.status === 'completed');
      
      // Calculate totals with better precision
      const totalRevenue = completedOrders.reduce((sum, o) => {
        const orderTotal = o.total || 0;
        // Also check earnings if available
        const earnings = o.earnings?.sellerEarnings || orderTotal;
        return sum + earnings;
      }, 0);
      
      const totalOrders = completedOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculate previous period for comparison
      const previousPeriod = this._getPreviousPeriod(period);
      const previousOrders = this._getOrdersForPeriod(sellerId, previousPeriod);
      const previousCompleted = previousOrders.filter(o => o.status === 'completed');
      const previousRevenue = previousCompleted.reduce((sum, o) => {
        const orderTotal = o.total || 0;
        const earnings = o.earnings?.sellerEarnings || orderTotal;
        return sum + earnings;
      }, 0);
      const previousOrdersCount = previousCompleted.length;
      const previousAOV = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;
      
      // Calculate changes with better handling
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : totalRevenue > 0 ? 100 : 0;
      const ordersChange = previousOrdersCount > 0
        ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100
        : totalOrders > 0 ? 100 : 0;
      const aovChange = previousAOV > 0
        ? ((averageOrderValue - previousAOV) / previousAOV) * 100
        : averageOrderValue > 0 ? 100 : 0;
      
      // Calculate growth rate (compound)
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const dailyGrowthRate = days > 0 && previousRevenue > 0
        ? Math.pow(totalRevenue / previousRevenue, 1 / days) - 1
        : 0;
      
      // Generate insights
      const insights = this._generateOverviewInsights({
        revenue: totalRevenue,
        orders: totalOrders,
        aov: averageOrderValue,
        revenueChange,
        ordersChange,
        aovChange,
        dailyGrowthRate
      });
      
      return {
        revenue: {
          current: totalRevenue,
          previous: previousRevenue,
          change: revenueChange,
          formatted: `R${totalRevenue.toFixed(2)}`,
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        orders: {
          current: totalOrders,
          previous: previousOrdersCount,
          change: ordersChange,
          trend: ordersChange >= 0 ? 'up' : 'down'
        },
        averageOrderValue: {
          current: averageOrderValue,
          previous: previousAOV,
          change: aovChange,
          trend: aovChange >= 0 ? 'up' : 'down'
        },
        dailyGrowthRate: dailyGrowthRate * 100, // Convert to percentage
        insights,
        period
      };
    });
  }
  
  /**
   * Generate insights for overview
   */
  _generateOverviewInsights(metrics) {
    const insights = [];
    
    if (metrics.revenueChange > 20) {
      insights.push(`🎉 Revenue is up ${metrics.revenueChange.toFixed(1)}% - excellent growth!`);
    } else if (metrics.revenueChange > 0) {
      insights.push(`📈 Revenue increased by ${metrics.revenueChange.toFixed(1)}%`);
    } else if (metrics.revenueChange < -10) {
      insights.push(`⚠️ Revenue decreased by ${Math.abs(metrics.revenueChange).toFixed(1)}% - consider promotions`);
    }
    
    if (metrics.ordersChange > 15) {
      insights.push(`🚀 Order volume up ${metrics.ordersChange.toFixed(1)}% - great momentum!`);
    }
    
    if (metrics.aovChange > 10) {
      insights.push(`💰 Average order value increased by ${metrics.aovChange.toFixed(1)}%`);
    } else if (metrics.aovChange < -5) {
      insights.push(`📉 AOV decreased - consider upselling strategies`);
    }
    
    if (metrics.dailyGrowthRate > 0.02) {
      insights.push(`📊 Strong daily growth rate of ${(metrics.dailyGrowthRate * 100).toFixed(2)}%`);
    }
    
    if (insights.length === 0) {
      insights.push('📊 Keep up the good work!');
    }
    
    return insights;
  }

  /**
   * Get sales heatmap by suburb with enhanced data
   */
  async getSalesHeatmap(sellerId, period = '7d') {
    const cacheKey = `heatmap_${sellerId}_${period}`;
    
    return this._getCached(cacheKey, () => {
      try {
        const orders = this._getOrdersForPeriod(sellerId, period);
        const completedOrders = orders.filter(o => o.status === 'completed');
      
      // Group orders by suburb with enhanced tracking
      const suburbData = {};
      
      completedOrders.forEach(order => {
        const suburb = (order.deliveryAddress?.suburb || 'Unknown').trim();
        if (!suburbData[suburb]) {
          suburbData[suburb] = {
            suburb,
            orders: 0,
            revenue: 0,
            activeBuyers: new Set(),
            popularProducts: {},
            averageOrderValue: 0,
            firstOrderDate: null,
            lastOrderDate: null
          };
        }
        
        suburbData[suburb].orders += 1;
        const orderTotal = order.total || 0;
        suburbData[suburb].revenue += orderTotal;
        
        if (order.buyerId) {
          suburbData[suburb].activeBuyers.add(order.buyerId);
        }
        
        // Track dates
        const orderDate = new Date(order.createdAt || order.completedAt);
        if (!suburbData[suburb].firstOrderDate || orderDate < suburbData[suburb].firstOrderDate) {
          suburbData[suburb].firstOrderDate = orderDate;
        }
        if (!suburbData[suburb].lastOrderDate || orderDate > suburbData[suburb].lastOrderDate) {
          suburbData[suburb].lastOrderDate = orderDate;
        }
        
        // Track popular products
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const productName = item.name || 'Unknown Product';
            suburbData[suburb].popularProducts[productName] = 
              (suburbData[suburb].popularProducts[productName] || 0) + item.quantity;
          });
        }
      });
      
      // Convert to array and format with coordinates
      const heatmapData = Object.values(suburbData).map(data => {
        const coords = this.suburbCoordinates[data.suburb] || null;
        return {
          suburb: data.suburb,
          orders: data.orders,
          revenue: data.revenue,
          activeBuyers: data.activeBuyers.size,
          averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
          popularProduct: this._getMostPopularProduct(data.popularProducts),
          coordinates: coords,
          firstOrderDate: data.firstOrderDate,
          lastOrderDate: data.lastOrderDate
        };
      });
      
      // Sort by orders descending
      heatmapData.sort((a, b) => b.orders - a.orders);
      
      // Calculate max for normalization
      const maxOrders = Math.max(...heatmapData.map(d => d.orders), 1);
      const maxRevenue = Math.max(...heatmapData.map(d => d.revenue), 1);
      
      // Add intensity for visualization (0-1 scale) with better distribution
      heatmapData.forEach(data => {
        // Use logarithmic scale for better visualization
        data.intensity = Math.log10(data.orders + 1) / Math.log10(maxOrders + 1);
        data.revenueIntensity = Math.log10(data.revenue + 1) / Math.log10(maxRevenue + 1);
      });
      
      // Get top suburbs with change percentage and insights
      const previousPeriod = this._getPreviousPeriod(period);
      const previousOrders = this._getOrdersForPeriod(sellerId, previousPeriod)
        .filter(o => o.status === 'completed');
      const previousSuburbData = {};
      previousOrders.forEach(order => {
        const suburb = (order.deliveryAddress?.suburb || 'Unknown').trim();
        previousSuburbData[suburb] = (previousSuburbData[suburb] || 0) + 1;
      });
      
      const topSuburbs = heatmapData.slice(0, 5).map(suburb => {
        const previousCount = previousSuburbData[suburb.suburb] || 0;
        const change = previousCount > 0 
          ? ((suburb.orders - previousCount) / previousCount) * 100 
          : suburb.orders > 0 ? 100 : 0;
        
        return {
          ...suburb,
          change,
          trend: change >= 0 ? 'up' : 'down'
        };
      });
      
      // Generate insights
      const insights = this._generateHeatmapInsights(heatmapData, topSuburbs);
      
        return {
          heatmap: heatmapData,
          topSuburbs,
          totalSuburbs: heatmapData.length,
          totalOrders: completedOrders.length,
          totalRevenue: completedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          hasData: heatmapData.length > 0,
          insights
        };
      } catch (error) {
        console.error('Error in getSalesHeatmap:', error);
        return {
          heatmap: [],
          topSuburbs: [],
          totalSuburbs: 0,
          totalOrders: 0,
          totalRevenue: 0,
          hasData: false,
          insights: []
        };
      }
    });
  }
  
  /**
   * Generate insights for heatmap
   */
  _generateHeatmapInsights(heatmapData, topSuburbs) {
    const insights = [];
    
    if (topSuburbs.length > 0) {
      const topSuburb = topSuburbs[0];
      if (topSuburb.change > 20) {
        insights.push(`🔥 ${topSuburb.suburb} is your fastest-growing area (+${topSuburb.change.toFixed(0)}%)`);
      }
      
      if (topSuburb.orders > 10) {
        insights.push(`📍 ${topSuburb.suburb} accounts for ${((topSuburb.orders / heatmapData.reduce((sum, s) => sum + s.orders, 0)) * 100).toFixed(0)}% of your orders`);
      }
    }
    
    const suburbsWithGrowth = topSuburbs.filter(s => s.change > 0).length;
    if (suburbsWithGrowth > 0) {
      insights.push(`📈 ${suburbsWithGrowth} out of ${topSuburbs.length} top suburbs are growing`);
    }
    
    return insights;
  }

  /**
   * Get time-series sales data with enhanced calculations
   */
  async getTimeSeries(sellerId, period = '7d', metric = 'revenue') {
    const cacheKey = `timeseries_${sellerId}_${period}_${metric}`;
    
    return this._getCached(cacheKey, () => {
      try {
        const orders = this._getOrdersForPeriod(sellerId, period);
        const completedOrders = orders.filter(o => o.status === 'completed');
      
      // Group by date
      const dateGroups = {};
    
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt || order.completedAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          aov: 0
        };
      }
      
      dateGroups[dateKey].revenue += order.total || 0;
      dateGroups[dateKey].orders += 1;
    });
    
    // Calculate AOV for each day
    Object.values(dateGroups).forEach(group => {
      group.aov = group.orders > 0 ? group.revenue / group.orders : 0;
    });
    
    // Convert to array and sort by date
    let timeSeries = Object.values(dateGroups).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Fill in missing dates with zero values
    timeSeries = this._fillMissingDates(timeSeries, period);
    
      // Generate insights
      const insights = this._generateTimeSeriesInsights(timeSeries, period);
      
      // Calculate week-over-week if period is 7d
      let weekOverWeek = null;
      let monthOverMonth = null;
      if (period === '7d') {
        const previousWeek = this._getOrdersForPeriod(sellerId, '7d', true);
        const previousCompleted = previousWeek.filter(o => o.status === 'completed');
        const previousRevenue = previousCompleted.reduce((sum, o) => sum + (o.total || 0), 0);
        const currentRevenue = timeSeries.reduce((sum, d) => sum + d.revenue, 0);
        weekOverWeek = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : currentRevenue > 0 ? 100 : 0;
      } else if (period === '30d') {
        const previousMonth = this._getOrdersForPeriod(sellerId, '30d', true);
        const previousCompleted = previousMonth.filter(o => o.status === 'completed');
        const previousRevenue = previousCompleted.reduce((sum, o) => sum + (o.total || 0), 0);
        const currentRevenue = timeSeries.reduce((sum, d) => sum + d.revenue, 0);
        monthOverMonth = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : currentRevenue > 0 ? 100 : 0;
      }
      
      // Calculate statistics
      const revenues = timeSeries.map(d => d.revenue);
      const orderCounts = timeSeries.map(d => d.orders);
      const aovs = timeSeries.map(d => d.aov);
      
      const stats = {
        revenue: {
          min: Math.min(...revenues),
          max: Math.max(...revenues),
          avg: revenues.reduce((a, b) => a + b, 0) / revenues.length,
          total: revenues.reduce((a, b) => a + b, 0)
        },
        orders: {
          min: Math.min(...orderCounts),
          max: Math.max(...orderCounts),
          avg: orderCounts.reduce((a, b) => a + b, 0) / orderCounts.length,
          total: orderCounts.reduce((a, b) => a + b, 0)
        },
        aov: {
          min: Math.min(...aovs),
          max: Math.max(...aovs),
          avg: aovs.reduce((a, b) => a + b, 0) / aovs.length
        }
      };
      
        return {
          data: timeSeries,
          insights,
          weekOverWeek,
          monthOverMonth,
          stats,
          period,
          metric
        };
      } catch (error) {
        console.error('Error in getTimeSeries:', error);
        return {
          data: [],
          insights: ['No data available yet'],
          weekOverWeek: null,
          monthOverMonth: null,
          stats: {
            revenue: { min: 0, max: 0, avg: 0, total: 0 },
            orders: { min: 0, max: 0, avg: 0, total: 0 },
            aov: { min: 0, max: 0, avg: 0 }
          },
          period,
          metric
        };
      }
    });
  }

  /**
   * Get product performance data
   */
  async getProductPerformance(sellerId, filter = 'bestsellers', period = '30d') {
    const orders = this._getOrdersForPeriod(sellerId, period);
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Aggregate product data
    const productData = {};
    
    completedOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const productId = item.productId || item.id;
          const productName = item.name || 'Unknown Product';
          
          if (!productData[productId]) {
            productData[productId] = {
              productId,
              name: productName,
              image: item.image || null,
              sales: 0,
              revenue: 0,
              quantity: 0,
              orders: new Set(),
              returns: 0 // Would need return data in real implementation
            };
          }
          
          productData[productId].sales += 1;
          productData[productId].revenue += (item.price || 0) * (item.quantity || 1);
          productData[productId].quantity += item.quantity || 1;
          productData[productId].orders.add(order.id);
        });
      }
    });
    
    // Convert to array
    let products = Object.values(productData).map(p => ({
      ...p,
      orders: p.orders.size,
      conversion: 0, // Would need view data for real conversion
      returns: p.returns
    }));
    
    // Calculate trending (simplified: compare with previous period)
    const previousPeriod = this._getPreviousPeriod(period);
    const previousOrders = this._getOrdersForPeriod(sellerId, previousPeriod);
    const previousCompleted = previousOrders.filter(o => o.status === 'completed');
    const previousProductData = {};
    
    previousCompleted.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const productId = item.productId || item.id;
          if (!previousProductData[productId]) {
            previousProductData[productId] = { sales: 0, revenue: 0 };
          }
          previousProductData[productId].sales += 1;
          previousProductData[productId].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    
    // Add trending data
    products = products.map(p => {
      const previous = previousProductData[p.productId] || { sales: 0, revenue: 0 };
      const salesChange = previous.sales > 0 
        ? ((p.sales - previous.sales) / previous.sales) * 100 
        : p.sales > 0 ? 100 : 0;
      const revenueChange = previous.revenue > 0
        ? ((p.revenue - previous.revenue) / previous.revenue) * 100
        : p.revenue > 0 ? 100 : 0;
      
      return {
        ...p,
        salesChange,
        revenueChange,
        isTrending: salesChange > 20,
        isDeclining: salesChange < -10
      };
    });
    
    // Apply filters
    if (filter === 'bestsellers') {
      products.sort((a, b) => b.sales - a.sales);
    } else if (filter === 'trending') {
      products = products.filter(p => p.isTrending);
      products.sort((a, b) => b.salesChange - a.salesChange);
    } else if (filter === 'low_performers') {
      products.sort((a, b) => a.sales - b.sales);
      products = products.filter(p => p.sales < 5); // Low threshold
    } else if (filter === 'returns') {
      products.sort((a, b) => b.returns - a.returns);
    }
    
    // Generate insights
    const insights = this._generateProductInsights(products, filter);
    
    return {
      products: products.slice(0, 20), // Top 20
      insights,
      filter,
      period
    };
  }

  /**
   * Get customer demographics
   */
  async getCustomerDemographics(sellerId, period = '30d') {
    const orders = this._getOrdersForPeriod(sellerId, period);
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Get unique customers
    const customers = new Set();
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
    const genders = { male: 0, female: 0, other: 0 };
    const distanceRanges = { '0-1km': 0, '1-3km': 0, '3-5km': 0, '5km+': 0 };
    
    completedOrders.forEach(order => {
      if (order.buyerId) {
        customers.add(order.buyerId);
      }
      
      // Mock demographic data (in real app, this would come from user profiles)
      // For demo, we'll simulate based on order patterns
      const buyerHash = order.buyerId ? this._hashString(order.buyerId) : Math.random();
      
      // Age distribution (simulated)
      const ageRand = buyerHash % 100;
      if (ageRand < 20) ageGroups['18-24']++;
      else if (ageRand < 50) ageGroups['25-34']++;
      else if (ageRand < 75) ageGroups['35-44']++;
      else ageGroups['45+']++;
      
      // Gender distribution (simulated)
      const genderRand = (buyerHash * 2) % 100;
      if (genderRand < 45) genders.male++;
      else if (genderRand < 90) genders.female++;
      else genders.other++;
      
      // Distance calculation (would need actual coordinates in real app)
      if (order.deliveryAddress) {
        // Mock distance based on suburb
        const distance = this._estimateDistance(order.deliveryAddress.suburb);
        if (distance < 1) distanceRanges['0-1km']++;
        else if (distance < 3) distanceRanges['1-3km']++;
        else if (distance < 5) distanceRanges['3-5km']++;
        else distanceRanges['5km+']++;
      }
    });
    
    // Convert to percentages
    const totalCustomers = customers.size || 1;
    const agePercentages = Object.keys(ageGroups).map(key => ({
      label: key,
      value: ageGroups[key],
      percentage: (ageGroups[key] / totalCustomers) * 100
    }));
    
    const genderPercentages = Object.keys(genders).map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: genders[key],
      percentage: (genders[key] / totalCustomers) * 100
    }));
    
    const distancePercentages = Object.keys(distanceRanges).map(key => ({
      label: key,
      value: distanceRanges[key],
      percentage: (distanceRanges[key] / totalCustomers) * 100
    }));
    
    // Generate insights
    const insights = this._generateDemographicInsights(agePercentages, genderPercentages, distancePercentages);
    
    return {
      totalCustomers: totalCustomers,
      ageGroups: agePercentages,
      genders: genderPercentages,
      distanceRanges: distancePercentages,
      insights,
      period
    };
  }

  // Helper methods

  _getOrdersForPeriod(sellerId, period, previousWeek = false) {
    try {
      // Normalize sellerId (handle both string and number)
      const normalizedSellerId = typeof sellerId === 'string' ? parseInt(sellerId, 10) || sellerId : sellerId;
      
      const allOrders = SellerOrderService.getSellerOrders(normalizedSellerId) || [];
      const now = new Date();
      let startDate;
      let endDate = null;
      
      if (previousWeek) {
        // Get previous week's data
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 7);
        return allOrders.filter(order => {
          if (!order || !order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate < endDate;
        });
      }
      
      switch (period) {
        case '7d':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
      }
      
      return allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate;
      });
    } catch (error) {
      console.error('Error in _getOrdersForPeriod:', error);
      return []; // Return empty array on error
    }
  }

  _getPreviousPeriod(period) {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case '7d':
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 7);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 30);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 90);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        return '7d';
    }
    
    return period; // For simplicity, return same period
  }

  _fillMissingDates(timeSeries, period) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const existing = timeSeries.find(ts => ts.date === dateKey);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          date: dateKey,
          revenue: 0,
          orders: 0,
          aov: 0
        });
      }
    }
    
    return result;
  }

  _getMostPopularProduct(products) {
    if (!products || Object.keys(products).length === 0) return null;
    return Object.entries(products)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  _generateTimeSeriesInsights(timeSeries, period) {
    const insights = [];
    
    if (timeSeries.length === 0) {
      return ['Your first chart will appear after your first completed order.'];
    }
    
    const totalRevenue = timeSeries.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = timeSeries.reduce((sum, d) => sum + d.orders, 0);
    const avgRevenue = totalRevenue / timeSeries.length;
    const avgOrders = totalOrders / timeSeries.length;
    
    // Find best and worst days
    const bestDay = timeSeries.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    , timeSeries[0]);
    
    const worstDay = timeSeries.reduce((worst, current) => 
      current.revenue < worst.revenue ? current : worst
    , timeSeries[0]);
    
    const bestDayName = new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long' });
    insights.push(`📅 Your best sales day is ${bestDayName} (R${bestDay.revenue.toFixed(0)})`);
    
    // Calculate average AOV
    const avgAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    if (avgAOV > 0) {
      insights.push(`💰 Average order value: R${avgAOV.toFixed(2)}`);
    }
    
    // Detect anomalies and trends
    const highRevenueDays = timeSeries.filter(d => d.revenue > avgRevenue * 1.5);
    if (highRevenueDays.length > 0) {
      const day = highRevenueDays[0];
      const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const spikePercent = Math.round(((day.revenue - avgRevenue) / avgRevenue) * 100);
      insights.push(`🚀 Sales spiked ${spikePercent}% above average on ${dayName}`);
    }
    
    // Calculate trend (comparing first half vs second half)
    if (timeSeries.length >= 4) {
      const midpoint = Math.floor(timeSeries.length / 2);
      const firstHalf = timeSeries.slice(0, midpoint);
      const secondHalf = timeSeries.slice(midpoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg * 1.1) {
        const trendPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        insights.push(`📈 Strong upward trend: ${trendPercent.toFixed(0)}% increase in second half`);
      } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        const trendPercent = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;
        insights.push(`📉 Declining trend: ${trendPercent.toFixed(0)}% decrease in second half`);
      }
    }
    
    // Day of week analysis
    const dayOfWeekStats = {};
    timeSeries.forEach(d => {
      const day = new Date(d.date).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
      if (!dayOfWeekStats[dayName]) {
        dayOfWeekStats[dayName] = { revenue: 0, count: 0 };
      }
      dayOfWeekStats[dayName].revenue += d.revenue;
      dayOfWeekStats[dayName].count += 1;
    });
    
    const bestDayOfWeek = Object.entries(dayOfWeekStats)
      .map(([day, stats]) => ({ day, avg: stats.revenue / stats.count }))
      .sort((a, b) => b.avg - a.avg)[0];
    
    if (bestDayOfWeek && bestDayOfWeek.avg > avgRevenue * 1.1) {
      insights.push(`⭐ ${bestDayOfWeek.day}s are your strongest day (avg R${bestDayOfWeek.avg.toFixed(0)})`);
    }
    
    return insights;
  }

  _generateProductInsights(products, filter) {
    const insights = [];
    
    if (products.length === 0) {
      return ['Add at least 3 products to see performance insights.'];
    }
    
    if (filter === 'trending') {
      const topTrending = products[0];
      if (topTrending && topTrending.salesChange > 0) {
        insights.push(`🔥 "${topTrending.name}" is trending (+${Math.round(topTrending.salesChange)}% vs last period)`);
      }
    } else if (filter === 'low_performers') {
      const lowPerformer = products[0];
      if (lowPerformer && lowPerformer.salesChange < 0) {
        insights.push(`⚠️ "${lowPerformer.name}" conversion dropping (${Math.round(Math.abs(lowPerformer.salesChange))}% decrease)`);
      }
    } else {
      const bestSeller = products[0];
      if (bestSeller) {
        insights.push(`✓ "${bestSeller.name}" is your top seller with ${bestSeller.sales} sales.`);
      }
    }
    
    return insights;
  }

  _generateDemographicInsights(ageGroups, genders, distances) {
    const insights = [];
    
    // Find fastest growing age group
    const topAgeGroup = ageGroups.reduce((top, current) => 
      current.value > top.value ? current : top
    , ageGroups[0]);
    insights.push(`Your fastest-growing customer group is ${topAgeGroup.label}.`);
    
    // Find most common distance
    const topDistance = distances.reduce((top, current) => 
      current.value > top.value ? current : top
    , distances[0]);
    insights.push(`Most of your buyers live within ${topDistance.label}.`);
    
    // Gender insights
    const topGender = genders.reduce((top, current) => 
      current.value > top.value ? current : top
    , genders[0]);
    if (topGender.value > 0) {
      const otherGender = genders.find(g => g.label !== topGender.label && g.value > 0);
      if (otherGender) {
        const diff = ((topGender.value - otherGender.value) / otherGender.value) * 100;
        insights.push(`${topGender.label} are ${Math.round(diff)}% more likely to buy.`);
      }
    }
    
    return insights;
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  _estimateDistance(suburb) {
    // Mock distance estimation based on suburb
    // In real app, would calculate actual distance using coordinates
    const distances = {
      'Sandton': 0.5,
      'Parkmore': 1.2,
      'Bryanston': 2.1,
      'Rosebank': 1.8,
      'Melrose': 1.5,
      'Illovo': 1.0,
      'Houghton': 2.5,
      'Killarney': 2.0,
      'Randburg': 3.5,
      'Fourways': 4.2,
      'Midrand': 6.0,
      'Centurion': 8.5,
      'Pretoria': 10.0
    };
    
    return distances[suburb] || 2.0;
  }
}

export const AnalyticsService = new AnalyticsServiceClass();

