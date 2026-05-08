// 订单管理 API
import { json, authMiddleware } from './auth.js';

// 与 payment.js 共享的订单存储
// 在生产环境中应使用数据库/Redis
let orders = [];

export function addOrder(order) {
  orders.unshift(order);
}

export function getOrders() {
  return orders;
}

export function getOrderByNo(orderNo) {
  return orders.find(o => o.orderNo === orderNo);
}

export function updateOrderStatus(orderNo, status) {
  const order = orders.find(o => o.orderNo === orderNo);
  if (order) {
    order.status = status;
    return order;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
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

  try {
    // GET — 获取订单列表或单个订单
    if (req.method === 'GET') {
      if (orderNo) {
        const order = getOrderByNo(orderNo);
        if (!order) return json(res, { success: false, error: '订单不存在' }, 404);
        return json(res, { success: true, data: order });
      }

      // 分页
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const status = url.searchParams.get('status');

      let filtered = orders;
      if (status) {
        filtered = orders.filter(o => o.status === status);
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return json(res, {
        success: true,
        data: {
          orders: items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('订单管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
