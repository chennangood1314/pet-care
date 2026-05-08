// 商品管理 API
import { json, authMiddleware } from './auth.js';
import { PRODUCTS, CATEGORIES, PET_TYPES } from '../data/products.js';

// 内存中的商品副本（允许运行时修改）
let products = [...PRODUCTS];
let nextId = Math.max(...products.map(p => p.id), 0) + 1;

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

  // 认证检查
  const user = authMiddleware(req);
  if (!user) {
    return json(res, { success: false, error: '未登录或登录已过期' }, 401);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.replace('/api/admin/products', '').split('/').filter(Boolean);
  const id = pathParts[0] ? parseInt(pathParts[0]) : null;

  try {
    // GET — 获取商品列表或单个商品
    if (req.method === 'GET') {
      if (id) {
        const product = products.find(p => p.id === id);
        if (!product) return json(res, { success: false, error: '商品不存在' }, 404);
        return json(res, { success: true, data: product });
      }
      return json(res, { success: true, data: { products, categories: CATEGORIES, petTypes: PET_TYPES } });
    }

    // POST — 新增商品
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { name, category, petType, price, originalPrice, desc, img, tags, badge } = body;

      if (!name || !category || !price) {
        return json(res, { success: false, error: '商品名称、分类、价格不能为空' }, 400);
      }

      const product = {
        id: nextId++,
        category,
        petType: petType || 'both',
        name,
        desc: desc || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
        rating: 5.0,
        sales: 0,
        badge: badge || '',
        img: img || '📦',
        tags: tags || []
      };

      products.push(product);
      return json(res, { success: true, data: product });
    }

    // PUT — 更新商品
    if (req.method === 'PUT') {
      if (!id) return json(res, { success: false, error: '缺少商品ID' }, 400);

      const index = products.findIndex(p => p.id === id);
      if (index === -1) return json(res, { success: false, error: '商品不存在' }, 404);

      const body = await parseBody(req);
      products[index] = { ...products[index], ...body, id: products[index].id };
      return json(res, { success: true, data: products[index] });
    }

    // DELETE — 删除商品
    if (req.method === 'DELETE') {
      if (!id) return json(res, { success: false, error: '缺少商品ID' }, 400);

      const index = products.findIndex(p => p.id === id);
      if (index === -1) return json(res, { success: false, error: '商品不存在' }, 404);

      products.splice(index, 1);
      return json(res, { success: true, data: { deleted: id } });
    }

    return json(res, { success: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('商品管理 API 错误:', error);
    return json(res, { success: false, error: '服务器内部错误' }, 500);
  }
}
