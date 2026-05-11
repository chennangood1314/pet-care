// 专家管理 API（需 JWT 认证）
import { json, authMiddleware } from './auth.js';
import { EXPERTS, SPECIALTIES } from '../data/experts.js';

let experts = [...EXPERTS];
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  const user = authMiddleware(req);
  if (!user) {
    return json(res, { success: false, error: '未登录或登录已过期' }, 401);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/admin/experts', '').split('/').filter(Boolean);
  const id = pathParts[0] ? parseInt(pathParts[0]) : null;
  const statusFilter = url.searchParams.get('status');

  try {
    // GET — 获取专家列表或单个专家
    if (req.method === 'GET') {
      if (id) {
        const expert = experts.find(e => e.id === id);
        if (!expert) return json(res, { success: false, error: '专家不存在' }, 404);
        return json(res, { success: true, data: expert });
      }
      let result = [...experts];
      if (statusFilter) {
        result = result.filter(e => e.status === statusFilter);
      }
      return json(res, { success: true, data: { experts: result, specialties: SPECIALTIES } });
    }

    // POST — 新增专家
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { name, phone, specialty, qualifications, hospital, avatar, introduction } = body;

      if (!name || !phone || !specialty) {
        return json(res, { success: false, error: '姓名、电话、主治方向不能为空' }, 400);
      }

      const expert = {
        id: nextId++,
        name,
        phone: phone || '',
        specialty: specialty || '',
        qualifications: qualifications || '',
        hospital: hospital || '',
        avatar: avatar || '👨‍⚕️',
        introduction: introduction || '',
        status: body.status || 'approved',
        createdAt: new Date().toISOString()
      };

      experts.push(expert);
      return json(res, { success: true, data: expert });
    }

    // PUT — 更新专家（含审核）
    if (req.method === 'PUT') {
      if (!id) return json(res, { success: false, error: '缺少专家ID' }, 400);

      const index = experts.findIndex(e => e.id === id);
      if (index === -1) return json(res, { success: false, error: '专家不存在' }, 404);

      const body = await parseBody(req);
      experts[index] = { ...experts[index], ...body, id: experts[index].id };
      return json(res, { success: true, data: experts[index] });
    }

    // DELETE — 删除专家
    if (req.method === 'DELETE') {
      if (!id) return json(res, { success: false, error: '缺少专家ID' }, 400);

      const index = experts.findIndex(e => e.id === id);
      if (index === -1) return json(res, { success: false, error: '专家不存在' }, 404);

      experts.splice(index, 1);
      return json(res, { success: true, data: { deleted: id } });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('专家管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
