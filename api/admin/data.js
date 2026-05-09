// 统一管理后台数据 API — 订单/用户/营收共享同一实例内存
import { json, authMiddleware } from './auth.js';

// ==================== 共享数据存储 ====================
const orders = [];
let nextSeq = 1;
const users = new Map();

// ==================== 工具函数 ====================
function formatDate(ts) {
  const d = new Date(ts);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return yy + mm + dd;
}

function randomStr(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ==================== 订单存储 ====================
function addOrder(order) {
  const now = Date.now();
  const seq = String(nextSeq++).padStart(4, '0');
  const orderNo = `PET${formatDate(now)}${seq}${randomStr(4)}`;
  const record = { orderNo, items: order.items || [], total: order.total || 0, status: order.status || 'pending', payMethod: order.payMethod || null, userId: order.userId || null, userName: order.userName || null, createdAt: now, paidAt: order.status === 'paid' ? now : null };
  orders.unshift(record);
  return record;
}

function getOrders(filter = {}) {
  let result = [...orders];
  if (filter.status) result = result.filter(o => o.status === filter.status);
  if (filter.userId) result = result.filter(o => o.userId === filter.userId);
  return result;
}

function getOrderByNo(orderNo) { return orders.find(o => o.orderNo === orderNo); }

function updateOrderStatus(orderNo, status) {
  const order = orders.find(o => o.orderNo === orderNo);
  if (order) { order.status = status; if (status === 'paid') order.paidAt = Date.now(); return order; }
  return null;
}

// ==================== 用户存储 ====================
function findOrCreateUser({ name, phone }) {
  const key = phone.replace(/\s/g, '');
  if (users.has(key)) return users.get(key);
  const user = { name, phone: key, createdAt: Date.now(), orderCount: 0, totalSpent: 0, firstOrderAt: null, lastOrderAt: null };
  users.set(key, user);
  return user;
}

function getUser(phone) { return users.get(phone?.replace(/\s/g, '')) || null; }

function getUsersList({ page = 1, pageSize = 20, search = '' } = {}) {
  let list = Array.from(users.values());
  if (search) { const s = search.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(s) || u.phone.includes(s)); }
  list.sort((a, b) => (b.lastOrderAt || b.createdAt) - (a.lastOrderAt || a.createdAt));
  const total = list.length, start = (page - 1) * pageSize;
  return { users: list.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

function updateUserStats(phone, orderTotal) {
  const user = getUser(phone);
  if (!user) return null;
  const now = Date.now();
  user.orderCount += 1;
  user.totalSpent = Math.round((user.totalSpent + orderTotal) * 100) / 100;
  user.lastOrderAt = now;
  if (!user.firstOrderAt) user.firstOrderAt = now;
  return user;
}

function deleteUser(phone) {
  const key = phone.replace(/\s/g, '');
  if (!users.has(key)) return false;
  users.delete(key);
  for (let i = orders.length - 1; i >= 0; i--) {
    if (orders[i].userId === key) orders.splice(i, 1);
  }
  return true;
}

// ==================== 营收统计 ====================
function getRevenueStats() {
  const paidOrders = orders.filter(o => o.status === 'paid');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const todayRevenue = paidOrders.filter(o => o.paidAt >= todayStart).reduce((s, o) => s + o.total, 0);
  const monthRevenue = paidOrders.filter(o => o.paidAt >= monthStart).reduce((s, o) => s + o.total, 0);
  return { totalRevenue: Math.round(totalRevenue * 100) / 100, todayRevenue: Math.round(todayRevenue * 100) / 100, monthRevenue: Math.round(monthRevenue * 100) / 100, orderCount: paidOrders.length, avgOrder: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length * 100) / 100 : 0 };
}

function getDailyRevenue(days = 7) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = d.getTime(), dayEnd = dayStart + 86400000;
    const dayOrders = orders.filter(o => o.status === 'paid' && o.paidAt >= dayStart && o.paidAt < dayEnd);
    result.push({ date: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`, amount: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100, count: dayOrders.length });
  }
  return result;
}

function getPaymentMethodStats() {
  const paidOrders = orders.filter(o => o.status === 'paid');
  const total = paidOrders.reduce((s, o) => s + o.total, 0);
  const methods = {};
  for (const o of paidOrders) {
    const m = o.payMethod || 'unknown';
    if (!methods[m]) methods[m] = { method: m, amount: 0, count: 0 };
    methods[m].amount += o.total; methods[m].count += 1;
  }
  for (const key of Object.keys(methods)) {
    methods[key].amount = Math.round(methods[key].amount * 100) / 100;
    methods[key].percentage = total > 0 ? Math.round(methods[key].amount / total * 1000) / 10 : 0;
  }
  return { total, items: Object.values(methods) };
}

function getOrdersByUser(userId) { return orders.filter(o => o.userId === userId); }

function seedTestData() {
  // 只在空数据时生成
  if (orders.length > 0 || users.size > 0) return;

  const sampleUsers = [
    { name: '张伟', phone: '13800138001' },
    { name: '李娜', phone: '13900139002' },
    { name: '王芳', phone: '13700137003' },
    { name: '赵敏', phone: '13600136004' },
    { name: '刘洋', phone: '13500135005' },
  ];
  const payMethods = ['alipay', 'wechat', 'card'];
  const sampleItems = [
    [{ id: 1, name: '天然狗粮 2kg', price: 128, quantity: 1 }],
    [{ id: 2, name: '猫咪营养膏', price: 88, quantity: 2 }],
    [{ id: 3, name: '宠物玩具套装', price: 59, quantity: 1 }, { id: 5, name: '宠物尿垫 50片', price: 39, quantity: 1 }],
    [{ id: 6, name: '猫砂 10L', price: 79, quantity: 3 }],
    [{ id: 4, name: '狗粮储存桶', price: 149, quantity: 1 }],
    [{ id: 7, name: '宠物洗发水', price: 68, quantity: 1 }, { id: 1, name: '天然狗粮 2kg', price: 128, quantity: 1 }],
    [{ id: 8, name: '狗狗咬胶 3个装', price: 35, quantity: 2 }],
  ];

  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    const user = sampleUsers[i % sampleUsers.length];
    const items = sampleItems[i % sampleItems.length];
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const payMethod = payMethods[i % 3];
    const daysAgo = Math.floor(i / 2);
    const createdAt = now - daysAgo * 86400000 - Math.floor(Math.random() * 3600000);

    const seq = String(nextSeq++).padStart(4, '0');
    const orderNo = `PET${formatDate(createdAt)}${seq}${randomStr(4)}`;

    const order = {
      orderNo, items, total,
      status: i < 10 ? 'paid' : (i === 10 ? 'pending' : 'cancelled'),
      payMethod, userId: user.phone, userName: user.name,
      createdAt, paidAt: i < 10 ? createdAt + 60000 : null
    };
    orders.unshift(order);

    if (order.status === 'paid') {
      findOrCreateUser(user);
      updateUserStats(user.phone, total);
    }
  }
  for (const u of sampleUsers) findOrCreateUser(u);
}

function syncOrderFromPayment(order) {
  const existing = orders.find(o => o.orderNo === order.orderNo);
  if (existing) {
    Object.assign(existing, order);
  } else {
    orders.unshift({ ...order });
  }
  if (order.userId && order.status === 'paid') {
    findOrCreateUser({ name: order.userName || '未留名', phone: order.userId });
    updateUserStats(order.userId, order.total);
  }
  return true;
}

// ==================== 请求体解析 ====================
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// ==================== 主 Handler ====================
export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Internal-Sync');
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const section = url.searchParams.get('section') || '';

  // 内部同步或生成测试数据
  if ((section === 'sync' || url.searchParams.get('sync') === '1' || section === 'seed') && req.method === 'POST') {
    if (section === 'seed') {
      seedTestData();
      return json(res, { success: true, data: { message: '测试数据已生成' } });
    }
    const body = await parseBody(req);
    syncOrderFromPayment(body);
    return json(res, { success: true });
  }

  // 认证检查（内部同步请求除外）
  if (req.headers['x-internal-sync'] !== '1') {
    const user = authMiddleware(req);
    if (!user) return json(res, { success: false, error: '未登录或登录已过期' }, 401);
  }

  try {
    // ========== 订单管理 ==========
    if (section === 'orders') {
      const orderNo = url.searchParams.get('orderNo');
      const userId = url.searchParams.get('userId');
      if (orderNo) {
        const order = getOrderByNo(orderNo);
        if (!order) return json(res, { success: false, error: '订单不存在' }, 404);
        return json(res, { success: true, data: order });
      }
      if (userId) {
        const userOrders = getOrders({ userId });
        return json(res, { success: true, data: { orders: userOrders, total: userOrders.length } });
      }
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const status = url.searchParams.get('status');
      const filter = {};
      if (status) filter.status = status;
      const all = getOrders(filter);
      const total = all.length, start = (page - 1) * pageSize;
      return json(res, { success: true, data: { orders: all.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
    }

    // ========== 用户管理 ==========
    if (section === 'users') {
      // POST — 手动创建用户
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const { name, phone } = body;
        if (!name || !phone) return json(res, { success: false, error: '姓名和手机号不能为空' }, 400);
        if (!/^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''))) return json(res, { success: false, error: '手机号格式不正确' }, 400);
        if (getUser(phone)) return json(res, { success: false, error: '该手机号已存在' }, 409);
        const user = findOrCreateUser({ name, phone });
        return json(res, { success: true, data: user });
      }
      // PUT — 编辑用户姓名
      if (req.method === 'PUT') {
        const phone = url.searchParams.get('phone');
        if (!phone) return json(res, { success: false, error: '缺少手机号参数' }, 400);
        const u = getUser(phone);
        if (!u) return json(res, { success: false, error: '用户不存在' }, 404);
        const body = await parseBody(req);
        if (body.name) u.name = body.name;
        return json(res, { success: true, data: u });
      }
      // DELETE — 删除用户及关联订单
      if (req.method === 'DELETE') {
        const phone = url.searchParams.get('phone');
        if (!phone) return json(res, { success: false, error: '缺少手机号参数' }, 400);
        if (!deleteUser(phone)) return json(res, { success: false, error: '用户不存在' }, 404);
        return json(res, { success: true, data: { message: '用户已删除' } });
      }
      // GET — 查询用户
      const phone = url.searchParams.get('phone');
      const withOrders = url.searchParams.get('orders') === 'true';
      if (phone) {
        const u = getUser(phone);
        if (!u) return json(res, { success: false, error: '用户不存在' }, 404);
        const data = { ...u };
        if (withOrders) data.orders = getOrdersByUser(phone);
        return json(res, { success: true, data });
      }
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const search = url.searchParams.get('search') || '';
      return json(res, { success: true, data: getUsersList({ page, pageSize, search }) });
    }

    // ========== 营收分析 ==========
    if (section === 'revenue') {
      const type = url.searchParams.get('type') || 'summary';
      const days = parseInt(url.searchParams.get('days')) || 7;
      switch (type) {
        case 'summary': return json(res, { success: true, data: getRevenueStats() });
        case 'daily': return json(res, { success: true, data: getDailyRevenue(days) });
        case 'payment': return json(res, { success: true, data: getPaymentMethodStats() });
        case 'recent': {
          const limit = parseInt(url.searchParams.get('limit')) || 10;
          const all = getOrders({ status: 'paid' });
          return json(res, { success: true, data: { orders: all.slice(0, limit), total: all.length } });
        }
        default: return json(res, { success: false, error: '未知的统计类型' }, 400);
      }
    }

    return json(res, { success: false, error: 'Not found' }, 404);
  } catch (error) {
    console.error('Admin Data API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
