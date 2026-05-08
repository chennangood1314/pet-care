// =============================================
// Vercel Serverless: 支付 API
// POST   /api/payment — 创建订单
// GET    /api/payment?orderNo=xxx — 查询订单状态
// PATCH  /api/payment — 模拟支付（demo模式）
// =============================================

// 内存存储（同一实例内复用）
// 生产环境应替换为 Vercel KV / Redis / 数据库
const orders = new Map();
const ORDER_EXPIRE_MS = 15 * 60 * 1000;

function cleanExpiredOrders() {
  const now = Date.now();
  for (const [id, order] of orders) {
    if (now - order.createdAt > ORDER_EXPIRE_MS && order.status === 'pending') {
      order.status = 'expired';
    }
  }
}

function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const h = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PET${y}${m}${d}${h}${min}${s}${rand}`;
}

// 解析请求 body
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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    // GET — 查询订单状态
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const orderNo = url.searchParams.get('orderNo');

      if (!orderNo) {
        return json(res, { error: '缺少订单号' }, 400);
      }

      const order = orders.get(orderNo);
      if (!order) {
        return json(res, { error: '订单不存在' }, 404);
      }

      return json(res, {
        success: true,
        data: { orderNo: order.orderNo, status: order.status, total: order.total }
      });
    }

    // POST — 创建订单
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { items, total } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return json(res, { error: '无效的商品信息' }, 400);
      }

      cleanExpiredOrders();

      const orderNo = generateOrderNo();
      const order = {
        orderNo,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total,
        status: 'pending',
        createdAt: Date.now(),
      };

      orders.set(orderNo, order);

      return json(res, {
        success: true,
        data: {
          orderNo: order.orderNo,
          total: order.total,
          status: order.status,
          qrCode: null,
          expiresAt: order.createdAt + ORDER_EXPIRE_MS,
        }
      });
    }

    // PATCH — 模拟支付操作（demo模式）
    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const { orderNo, action } = body || {};

      if (!orderNo) {
        return json(res, { error: '缺少订单号' }, 400);
      }

      const order = orders.get(orderNo);
      if (!order) {
        return json(res, { error: '订单不存在' }, 404);
      }

      if (action === 'pay') {
        order.status = 'paid';
        order.paidAt = Date.now();
        return json(res, { success: true, data: { orderNo: order.orderNo, status: 'paid' } });
      }

      if (action === 'cancel') {
        order.status = 'cancelled';
        return json(res, { success: true, data: { orderNo: order.orderNo, status: 'cancelled' } });
      }

      return json(res, { error: '无效的操作' }, 400);
    }

    return json(res, { error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('支付 API 错误:', error);
    return json(res, { error: '服务器内部错误' }, 500);
  }
}
