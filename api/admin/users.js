// 用户管理 API
import { json, authMiddleware } from './auth.js';
import { getUsers, getUser } from '../shared/userStore.js';
import { getOrdersByUser } from '../shared/orderStore.js';

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
  const phone = url.searchParams.get('phone');
  const withOrders = url.searchParams.get('orders') === 'true';

  try {
    if (req.method === 'GET') {
      // 单个用户详情（含订单列表）
      if (phone) {
        const u = getUser(phone);
        if (!u) return json(res, { success: false, error: '用户不存在' }, 404);

        const data = { ...u };
        if (withOrders) {
          data.orders = getOrdersByUser(phone);
        }
        return json(res, { success: true, data });
      }

      // 用户列表（分页+搜索）
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const search = url.searchParams.get('search') || '';

      const result = getUsers({ page, pageSize, search });
      return json(res, { success: true, data: result });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('用户管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
