// 简单的管理后台认证模块
import crypto from 'crypto';

const AUTH_SECRET = process.env.ADMIN_SECRET || 'pet-care-admin-secret-2026';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf-8');
}

export function createToken(payload, expiresInSec = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const data = { ...payload, iat: now, exp: now + expiresInSec };

  const h = base64url(JSON.stringify(header));
  const d = base64url(JSON.stringify(data));
  const sig = base64url(crypto.createHmac('sha256', AUTH_SECRET).update(`${h}.${d}`).digest('base64'));

  return `${h}.${d}.${sig}`;
}

export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const data = JSON.parse(base64urlDecode(parts[1]));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    const sig = base64url(crypto.createHmac('sha256', AUTH_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64'));
    if (sig !== parts[2]) return null;

    return data;
  } catch {
    return null;
  }
}

export function validateCredentials(username, password) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function authMiddleware(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  return verifyToken(token);
}

export function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}
