// 营收分析 API
import { json, authMiddleware } from './auth.js';
import { getRevenueStats, getDailyRevenue, getPaymentMethodStats, getOrders } from '../shared/orderStore.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  const user = authMiddleware(req);
  if (!user) {
    return json(res, { success: false, error: '未登录或登录已过期' }, 401);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type') || 'summary';
  const days = parseInt(url.searchParams.get('days')) || 7;

  try {
    if (req.method === 'GET') {
      switch (type) {
        case 'summary': {
          const stats = getRevenueStats();
          return json(res, { success: true, data: stats });
        }
        case 'daily': {
          const data = getDailyRevenue(days);
          return json(res, { success: true, data });
        }
        case 'payment': {
          const data = getPaymentMethodStats();
          return json(res, { success: true, data });
        }
        case 'recent': {
          const limit = parseInt(url.searchParams.get('limit')) || 10;
          const all = getOrders({ status: 'paid' });
          const recent = all.slice(0, limit);
          return json(res, { success: true, data: { orders: recent, total: all.length } });
        }
        default:
          return json(res, { success: false, error: '未知的统计类型' }, 400);
      }
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('营收分析 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
