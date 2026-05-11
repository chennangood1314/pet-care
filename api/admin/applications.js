// 求职申请管理 API（需 JWT 认证）
import { json, authMiddleware } from './auth.js';
import { APPLICATIONS, APPLICATION_STATUS } from '../data/applications.js';

let applications = [...APPLICATIONS];
let nextId = Math.max(...applications.map(a => a.id), 0) + 1;

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  const user = authMiddleware(req);
  if (!user) {
    return json(res, { success: false, error: '未登录或登录已过期' }, 401);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/admin/applications', '').split('/').filter(Boolean);
  const id = pathParts[0] ? parseInt(pathParts[0]) : null;
  const jobId = url.searchParams.get('jobId');
  const statusFilter = url.searchParams.get('status');

  try {
    // GET — 获取申请列表
    if (req.method === 'GET') {
      if (id) {
        const app = applications.find(a => a.id === id);
        if (!app) return json(res, { success: false, error: '申请不存在' }, 404);
        return json(res, { success: true, data: app });
      }
      let result = [...applications];
      if (jobId) {
        result = result.filter(a => a.jobId === parseInt(jobId));
      }
      if (statusFilter) {
        result = result.filter(a => a.status === statusFilter);
      }
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(res, { success: true, data: { applications: result, applicationStatus: APPLICATION_STATUS } });
    }

    // PUT — 更新申请状态
    if (req.method === 'PUT') {
      if (!id) return json(res, { success: false, error: '缺少申请ID' }, 400);

      const index = applications.findIndex(a => a.id === id);
      if (index === -1) return json(res, { success: false, error: '申请不存在' }, 404);

      const body = await parseBody(req);
      applications[index] = { ...applications[index], ...body, id: applications[index].id };
      return json(res, { success: true, data: applications[index] });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('申请管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
