// 支付 API — 创建订单 / 查询状态 / 模拟支付
// POST   /api/payment         创建订单（含用户信息）
// GET    /api/payment?orderNo=xxx  查询订单
// PATCH  /api/payment         模拟支付/取消

import { addOrder, getOrderByNo, updateOrderStatus } from './shared/orderStore.js';
import { findOrCreateUser, updateUserStats } from './shared/userStore.js';

const ORDER_EXPIRE_MS = 15 * 60 * 1000;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end(); }

  try {
    // GET — 查询订单状态
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const orderNo = url.searchParams.get('orderNo');
      if (!orderNo) return json(res, { error: '缺少订单号' }, 400);

      const order = getOrderByNo(orderNo);
      if (!order) return json(res, { error: '订单不存在' }, 404);

      const now = Date.now();
      if (order.status === 'pending' && now - order.createdAt > ORDER_EXPIRE_MS) {
        updateOrderStatus(orderNo, 'expired');
        order.status = 'expired';
      }

      return json(res, {
        success: true,
        data: { orderNo: order.orderNo, status: order.status, total: order.total }
      });
    }

    // POST — 创建订单
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { items, total, payMethod, userInfo } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return json(res, { error: '无效的商品信息' }, 400);
      }

      // 注册/查找用户
      let userId = null, userName = null;
      if (userInfo && userInfo.phone) {
        const user = findOrCreateUser({ name: userInfo.name || '未留名', phone: userInfo.phone });
        userId = user.phone;
        userName = user.name;
      }

      const record = addOrder({
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total,
        status: 'pending',
        payMethod: payMethod || null,
        userId,
        userName
      });

      return json(res, {
        success: true,
        data: {
          orderNo: record.orderNo,
          total: record.total,
          status: record.status,
          qrCode: null,
          expiresAt: record.createdAt + ORDER_EXPIRE_MS
        }
      });
    }

    // PATCH — 模拟支付（demo模式）
    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const { orderNo, action } = body || {};

      if (!orderNo) return json(res, { error: '缺少订单号' }, 400);

      const order = getOrderByNo(orderNo);
      if (!order) return json(res, { error: '订单不存在' }, 404);

      if (action === 'pay') {
        updateOrderStatus(orderNo, 'paid');
        // 更新用户消费统计
        if (order.userId) {
          updateUserStats(order.userId, order.total);
        }
        return json(res, { success: true, data: { orderNo, status: 'paid' } });
      }

      if (action === 'cancel') {
        updateOrderStatus(orderNo, 'cancelled');
        return json(res, { success: true, data: { orderNo, status: 'cancelled' } });
      }

      return json(res, { error: '无效的操作' }, 400);
    }

    return json(res, { error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('支付 API 错误:', error);
    return json(res, { error: '服务器内部错误' }, 500);
  }
}
