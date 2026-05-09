// 支付 API — 创建订单 / 查询状态 / 模拟支付
// POST   /api/payment         创建订单（含用户信息）
// GET    /api/payment?orderNo=xxx  查询订单
// PATCH  /api/payment         模拟支付/取消
// 支付成功后通过内部调用同步数据到 admin data API

const orders = new Map();
const ORDER_EXPIRE_MS = 15 * 60 * 1000;
let nextSeq = 1;

function formatDate(ts) { const d = new Date(ts); return String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0'); }
function randomStr(len) { const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s; }

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// 同步订单数据到 admin data API
async function syncToAdmin(order, req) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const base = `${proto}://${host}`;
    await fetch(`${base}/api/admin/data/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Sync': '1' },
      body: JSON.stringify(order)
    });
  } catch (e) { /* 静默失败，不影响支付流程 */ }
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

      const order = orders.get(orderNo);
      if (!order) return json(res, { error: '订单不存在' }, 404);

      const now = Date.now();
      if (order.status === 'pending' && now - order.createdAt > ORDER_EXPIRE_MS) {
        order.status = 'expired';
      }

      return json(res, { success: true, data: { orderNo: order.orderNo, status: order.status, total: order.total } });
    }

    // POST — 创建订单
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { items, total, payMethod, userInfo } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return json(res, { error: '无效的商品信息' }, 400);
      }

      const now = Date.now();
      const seq = String(nextSeq++).padStart(4, '0');
      const orderNo = `PET${formatDate(now)}${seq}${randomStr(4)}`;

      const order = {
        orderNo,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total,
        status: 'pending',
        payMethod: payMethod || null,
        userId: userInfo?.phone || null,
        userName: userInfo?.name || null,
        createdAt: now,
        paidAt: null
      };

      orders.set(orderNo, order);

      return json(res, {
        success: true,
        data: { orderNo: order.orderNo, total: order.total, status: order.status, qrCode: null, expiresAt: order.createdAt + ORDER_EXPIRE_MS }
      });
    }

    // PATCH — 模拟支付
    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const { orderNo, action } = body || {};

      if (!orderNo) return json(res, { error: '缺少订单号' }, 400);

      const order = orders.get(orderNo);
      if (!order) return json(res, { error: '订单不存在' }, 404);

      if (action === 'pay') {
        order.status = 'paid';
        order.paidAt = Date.now();
        // 同步到 admin data API
        await syncToAdmin(order, req);
        return json(res, { success: true, data: { orderNo, status: 'paid' } });
      }

      if (action === 'cancel') {
        order.status = 'cancelled';
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
