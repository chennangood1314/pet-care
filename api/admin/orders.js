// 订单管理 API
import { json, authMiddleware } from './auth.js';
import { getOrders, getOrderByNo } from '../shared/orderStore.js';

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
  const orderNo = url.searchParams.get('orderNo');
  const userId = url.searchParams.get('userId');

  try {
    if (req.method === 'GET') {
      // 单个订单
      if (orderNo) {
        const order = getOrderByNo(orderNo);
        if (!order) return json(res, { success: false, error: '订单不存在' }, 404);
        return json(res, { success: true, data: order });
      }

      // 按用户筛选
      if (userId) {
        const orders = getOrders({ userId });
        return json(res, { success: true, data: { orders, total: orders.length } });
      }

      // 分页列表
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const status = url.searchParams.get('status');

      const filter = {};
      if (status) filter.status = status;

      const all = getOrders(filter);
      const total = all.length;
      const start = (page - 1) * pageSize;
      const items = all.slice(start, start + pageSize);

      return json(res, {
        success: true,
        data: { orders: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
      });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('订单管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
