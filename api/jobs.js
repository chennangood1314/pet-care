// 公开岗位 API（无需认证，供前台使用）
import { json } from './admin/auth.js';
import { JOBS as SEED_JOBS, JOB_TYPES } from './data/jobs.js';
import { APPLICATIONS as SEED_APPLICATIONS } from './data/applications.js';

let jobs = [...SEED_JOBS];
let nextJobId = Math.max(...jobs.map(j => j.id), 0) + 1;
let applications = [...SEED_APPLICATIONS];
let nextAppId = Math.max(...applications.map(a => a.id), 0) + 1;

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
  const pathParts = url.pathname.replace('/api/jobs', '').split('/').filter(Boolean);
  const jobId = parseInt(url.searchParams.get('id')) || (pathParts[0] ? parseInt(pathParts[0]) : null);
  const isApply = url.searchParams.get('action') === 'apply' || pathParts[1] === 'apply';

  try {
    // GET — 获取已审核通过的岗位列表或单个岗位
    if (req.method === 'GET') {
      if (jobId && !isApply) {
        const job = jobs.find(j => j.id === jobId && j.status === 'approved');
        if (!job) return json(res, { success: false, error: '岗位不存在' }, 404);
        return json(res, { success: true, data: job });
      }
      const search = url.searchParams.get('search') || '';
      const location = url.searchParams.get('location') || '';
      const type = url.searchParams.get('type') || '';

      let result = jobs.filter(j => j.status === 'approved');

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(j =>
          j.title.toLowerCase().includes(q) ||
          j.clinicName.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
        );
      }
      if (location) {
        result = result.filter(j => j.location.includes(location));
      }
      if (type) {
        result = result.filter(j => j.type === type);
      }

      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(res, { success: true, data: { jobs: result, jobTypes: JOB_TYPES } });
    }

    // POST — 发布岗位（status=pending 待审核）或求职申请
    if (req.method === 'POST') {
      const body = await parseBody(req);

      // 求职者申请岗位: POST /api/jobs/{id}/apply
      if (jobId && isApply) {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return json(res, { success: false, error: '岗位不存在' }, 404);

        const { applicantName, applicantPhone, applicantEmail, experience, resume } = body;
        if (!applicantName || !applicantPhone) {
          return json(res, { success: false, error: '姓名和电话不能为空' }, 400);
        }
        if (!/^1[3-9]\d{9}$/.test(applicantPhone)) {
          return json(res, { success: false, error: '手机号格式不正确' }, 400);
        }

        const application = {
          id: nextAppId++,
          jobId: job.id,
          jobTitle: job.title,
          clinicName: job.clinicName,
          applicantName,
          applicantPhone,
          applicantEmail: applicantEmail || '',
          experience: experience || '',
          resume: resume || '',
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        applications.push(application);

        // 增加岗位申请计数
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
          jobs[jobIndex].applicantCount = (jobs[jobIndex].applicantCount || 0) + 1;
        }

        return json(res, { success: true, data: application, message: '申请已提交，招聘方将尽快联系您' });
      }

      // 诊所发布岗位: POST /api/jobs
      const { title, clinicName, salary, location, experience, education, description, requirements, benefits, contactPhone, contactPerson, type } = body;
      if (!title || !clinicName) {
        return json(res, { success: false, error: '岗位名称和诊所名称不能为空' }, 400);
      }

      const job = {
        id: nextJobId++,
        clinicName,
        title,
        salary: salary || '面议',
        location: location || '',
        experience: experience || '不限',
        education: education || '不限',
        description: description || '',
        requirements: requirements || '',
        benefits: benefits || '',
        contactPhone: contactPhone || '',
        contactPerson: contactPerson || '',
        type: type || 'fulltime',
        status: 'pending',
        createdAt: new Date().toISOString(),
        applicantCount: 0
      };

      jobs.push(job);
      return json(res, { success: true, data: job, message: '岗位已发布，请等待管理员审核' });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('公开岗位 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
