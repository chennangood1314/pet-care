// 统一订单存储 — 所有模块共享同一份数据
const orders = [];
let nextSeq = 1;

export function addOrder(order) {
  const now = Date.now();
  const seq = String(nextSeq++).padStart(4, '0');
  const orderNo = `PET${formatDate(now)}${seq}${randomStr(4)}`;

  const record = {
    orderNo,
    items: order.items || [],
    total: order.total || 0,
    status: order.status || 'pending',
    payMethod: order.payMethod || null,
    userId: order.userId || null,
    userName: order.userName || null,
    createdAt: now,
    paidAt: order.status === 'paid' ? now : null
  };

  orders.unshift(record);
  return record;
}

export function getOrders(filter = {}) {
  let result = [...orders];
  if (filter.status) result = result.filter(o => o.status === filter.status);
  if (filter.userId) result = result.filter(o => o.userId === filter.userId);
  if (filter.payMethod) result = result.filter(o => o.payMethod === filter.payMethod);
  return result;
}

export function getOrderByNo(orderNo) {
  return orders.find(o => o.orderNo === orderNo);
}

export function updateOrderStatus(orderNo, status) {
  const order = orders.find(o => o.orderNo === orderNo);
  if (order) {
    order.status = status;
    if (status === 'paid') order.paidAt = Date.now();
    return order;
  }
  return null;
}

// ==================== 营收统计 ====================

export function getRevenueStats() {
  const paidOrders = orders.filter(o => o.status === 'paid');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const todayRevenue = paidOrders.filter(o => o.paidAt >= todayStart).reduce((s, o) => s + o.total, 0);
  const monthRevenue = paidOrders.filter(o => o.paidAt >= monthStart).reduce((s, o) => s + o.total, 0);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    monthRevenue: Math.round(monthRevenue * 100) / 100,
    orderCount: paidOrders.length,
    avgOrder: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length * 100) / 100 : 0
  };
}

export function getDailyRevenue(days = 7) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = d.getTime();
    const dayEnd = dayStart + 86400000;
    const dayOrders = orders.filter(o => o.status === 'paid' && o.paidAt >= dayStart && o.paidAt < dayEnd);
    result.push({
      date: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
      amount: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      count: dayOrders.length
    });
  }
  return result;
}

export function getPaymentMethodStats() {
  const paidOrders = orders.filter(o => o.status === 'paid');
  const total = paidOrders.reduce((s, o) => s + o.total, 0);

  const methods = {};
  for (const o of paidOrders) {
    const m = o.payMethod || 'unknown';
    if (!methods[m]) methods[m] = { method: m, amount: 0, count: 0 };
    methods[m].amount += o.total;
    methods[m].count += 1;
  }

  for (const key of Object.keys(methods)) {
    methods[key].amount = Math.round(methods[key].amount * 100) / 100;
    methods[key].percentage = total > 0 ? Math.round(methods[key].amount / total * 1000) / 10 : 0;
  }

  return { total, items: Object.values(methods) };
}

export function getOrdersByUser(userId) {
  return orders.filter(o => o.userId === userId);
}

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
