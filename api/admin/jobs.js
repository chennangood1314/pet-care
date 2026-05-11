// 岗位管理 API（需 JWT 认证）
import { json, authMiddleware } from './auth.js';
import { JOBS, JOB_TYPES } from '../data/jobs.js';

let jobs = [...JOBS];
let nextId = Math.max(...jobs.map(j => j.id), 0) + 1;

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
  const pathParts = url.pathname.replace('/api/admin/jobs', '').split('/').filter(Boolean);
  const id = pathParts[0] ? parseInt(pathParts[0]) : null;
  const statusFilter = url.searchParams.get('status');

  try {
    // GET — 获取岗位列表或单个岗位
    if (req.method === 'GET') {
      if (id) {
        const job = jobs.find(j => j.id === id);
        if (!job) return json(res, { success: false, error: '岗位不存在' }, 404);
        return json(res, { success: true, data: job });
      }
      let result = [...jobs];
      if (statusFilter) {
        result = result.filter(j => j.status === statusFilter);
      }
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(res, { success: true, data: { jobs: result, jobTypes: JOB_TYPES } });
    }

    // POST — 新增岗位
    if (req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.title || !body.clinicName) {
        return json(res, { success: false, error: '岗位名称和诊所名称不能为空' }, 400);
      }

      const job = {
        id: nextId++,
        clinicName: body.clinicName || '',
        title: body.title || '',
        salary: body.salary || '面议',
        location: body.location || '',
        experience: body.experience || '不限',
        education: body.education || '不限',
        description: body.description || '',
        requirements: body.requirements || '',
        benefits: body.benefits || '',
        contactPhone: body.contactPhone || '',
        contactPerson: body.contactPerson || '',
        type: body.type || 'fulltime',
        status: body.status || 'approved',
        createdAt: new Date().toISOString(),
        applicantCount: body.applicantCount || 0
      };

      jobs.push(job);
      return json(res, { success: true, data: job });
    }

    // PUT — 更新岗位（含审核）
    if (req.method === 'PUT') {
      if (!id) return json(res, { success: false, error: '缺少岗位ID' }, 400);

      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) return json(res, { success: false, error: '岗位不存在' }, 404);

      const body = await parseBody(req);
      jobs[index] = { ...jobs[index], ...body, id: jobs[index].id };
      return json(res, { success: true, data: jobs[index] });
    }

    // DELETE — 删除岗位
    if (req.method === 'DELETE') {
      if (!id) return json(res, { success: false, error: '缺少岗位ID' }, 400);

      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) return json(res, { success: false, error: '岗位不存在' }, 404);

      jobs.splice(index, 1);
      return json(res, { success: true, data: { deleted: id } });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('岗位管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
