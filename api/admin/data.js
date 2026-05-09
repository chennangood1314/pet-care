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

function syncOrderFromPayment(order) {
  // 接收 payment API 同步过来的订单数据
  const existing = orders.find(o => o.orderNo === order.orderNo);
  if (existing) {
    Object.assign(existing, order);
  } else {
    orders.unshift({ ...order });
  }
  // 同步用户数据
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Internal-Sync');
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const section = url.searchParams.get('section') || '';

  // 内部同步：payment API 同步订单数据
  if ((section === 'sync' || url.searchParams.get('sync') === '1') && req.method === 'POST') {
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
