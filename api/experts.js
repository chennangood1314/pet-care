// 公开专家 API（无需认证，供前台使用）
import { json } from './admin/auth.js';
import { EXPERTS as SEED_EXPERTS } from './data/experts.js';

// 从种子数据初始化（公开API与admin API共享同一份数据在各自模块中）
// 这里使用独立的副本
let experts = [...SEED_EXPERTS];
let nextId = Math.max(...experts.map(e => e.id), 0) + 1;

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/experts', '').split('/').filter(Boolean);

  try {
    // GET — 获取已审核通过的专家列表
    if (req.method === 'GET') {
      const approved = experts.filter(e => e.status === 'approved');
      return json(res, { success: true, data: approved });
    }

    // POST — 专家自行注册（注册后状态为 pending，需等管理员审核）
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { name, phone, specialty, qualifications, hospital, introduction } = body;

      if (!name || !phone || !specialty) {
        return json(res, { success: false, error: '姓名、电话、主治方向不能为空' }, 400);
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return json(res, { success: false, error: '手机号格式不正确' }, 400);
      }

      // 检查手机号是否已注册
      const exists = experts.find(e => e.phone === phone);
      if (exists) {
        return json(res, { success: false, error: '该手机号已注册' }, 400);
      }

      const expert = {
        id: nextId++,
        name,
        phone,
        specialty,
        qualifications: qualifications || '',
        hospital: hospital || '',
        avatar: '👨‍⚕️',
        introduction: introduction || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      experts.push(expert);
      return json(res, { success: true, data: expert, message: '注册成功，请等待管理员审核' });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('公开专家 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
