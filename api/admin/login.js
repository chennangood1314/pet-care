// 管理员登录 API
import { createToken, validateCredentials, json } from './auth.js';

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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return json(res, { success: false, error: '仅支持 POST 请求' }, 405);
  }

  const { username, password } = await parseBody(req);

  if (!username || !password) {
    return json(res, { success: false, error: '请输入用户名和密码' }, 400);
  }

  if (!validateCredentials(username, password)) {
    return json(res, { success: false, error: '用户名或密码错误' }, 401);
  }

  const token = createToken({ username, role: 'admin' }, 7200);

  return json(res, {
    success: true,
    data: {
      token,
      username,
      expiresIn: 7200
    }
  });
}
