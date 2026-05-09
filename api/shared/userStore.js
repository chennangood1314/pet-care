// 用户存储 — 手机号为主键，下单时自动创建
const users = new Map();

export function findOrCreateUser({ name, phone }) {
  const key = phone.replace(/\s/g, '');
  if (users.has(key)) return users.get(key);

  const user = {
    name,
    phone: key,
    createdAt: Date.now(),
    orderCount: 0,
    totalSpent: 0,
    firstOrderAt: null,
    lastOrderAt: null
  };
  users.set(key, user);
  return user;
}

export function getUser(phone) {
  return users.get(phone?.replace(/\s/g, '')) || null;
}

export function getUsers({ page = 1, pageSize = 20, search = '' } = {}) {
  let list = Array.from(users.values());
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(s) || u.phone.includes(s));
  }
  // 按最近下单时间排序
  list.sort((a, b) => (b.lastOrderAt || b.createdAt) - (a.lastOrderAt || a.createdAt));

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  return { users: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function updateUserStats(phone, orderTotal) {
  const user = getUser(phone);
  if (!user) return null;

  const now = Date.now();
  user.orderCount += 1;
  user.totalSpent = Math.round((user.totalSpent + orderTotal) * 100) / 100;
  user.lastOrderAt = now;
  if (!user.firstOrderAt) user.firstOrderAt = now;
  return user;
}

export function getUserCount() {
  return users.size;
}
