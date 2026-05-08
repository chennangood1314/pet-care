// =============================================
// 宠物商城 - 商品数据与展示
// =============================================

const PRODUCTS = [
  // 宠物食品
  {
    id: 1, category: 'food', petType: 'both',
    name: '皇家幼犬奶糕粮 2kg',
    desc: '法国皇家 | 适合0-2月龄幼犬',
    price: 128, originalPrice: 168,
    rating: 4.9, sales: 12860,
    badge: '热销',
    img: '🐾',
    tags: ['进口', '天然', '无谷物']
  },
  {
    id: 2, category: 'food', petType: 'cat',
    name: '希尔斯幼猫粮 1.5kg',
    desc: '希尔斯 | 适合1-12月龄幼猫',
    price: 158, originalPrice: 198,
    rating: 4.8, sales: 9320,
    badge: '推荐',
    img: '🐱',
    tags: ['进口', '高蛋白']
  },
  {
    id: 3, category: 'food', petType: 'dog',
    name: '比瑞吉小型犬鸡肉粮 4kg',
    desc: '比瑞吉 | 适合小型犬',
    price: 168, originalPrice: 220,
    rating: 4.7, sales: 7640,
    badge: '特惠',
    img: '🐶',
    tags: ['国产优选', '消化好']
  },
  {
    id: 4, category: 'food', petType: 'cat',
    name: '汪喵星球冻干猫粮 500g',
    desc: '汪喵星球 | 全猫期适用',
    price: 88, originalPrice: 110,
    rating: 4.9, sales: 15200,
    badge: '爆款',
    img: '❄️',
    tags: ['冻干', '高肉量', '无添加']
  },
  // 健康护理
  {
    id: 5, category: 'health', petType: 'both',
    name: '福来恩犬猫体外驱虫滴剂',
    desc: '拜耳 | 一次使用保护1个月',
    price: 65, originalPrice: 88,
    rating: 4.9, sales: 23100,
    badge: '必备',
    img: '💊',
    tags: ['进口', '驱虫', '防跳蚤']
  },
  {
    id: 6, category: 'health', petType: 'both',
    name: '维克犬猫洗耳液 118ml',
    desc: '维克 | 清洁护耳防感染',
    price: 48, originalPrice: 68,
    rating: 4.7, sales: 8800,
    badge: '',
    img: '👂',
    tags: ['温和', '防感染']
  },
  {
    id: 7, category: 'health', petType: 'both',
    name: '海乐思宠物益生菌粉 60g',
    desc: '海乐思 | 调节肠胃 增强免疫',
    price: 98, originalPrice: 128,
    rating: 4.8, sales: 11400,
    badge: '推荐',
    img: '🌿',
    tags: ['益生菌', '肠胃好']
  },
  {
    id: 8, category: 'health', petType: 'both',
    name: '宠物专用指甲剪套装',
    desc: '专业级 | 防夹肉设计',
    price: 39, originalPrice: 59,
    rating: 4.6, sales: 6700,
    badge: '',
    img: '✂️',
    tags: ['安全', '易操作']
  },
  // 玩具用品
  {
    id: 9, category: 'toy', petType: 'cat',
    name: '逗猫棒羽毛套装 5件组',
    desc: '多款组合 | 提升互动乐趣',
    price: 29, originalPrice: 45,
    rating: 4.8, sales: 19800,
    badge: '超值',
    img: '🪶',
    tags: ['互动', '耐用']
  },
  {
    id: 10, category: 'toy', petType: 'dog',
    name: '狗狗磨牙耐咬玩具球',
    desc: '天然橡胶 | 保护牙齿 缓解压力',
    price: 35, originalPrice: 55,
    rating: 4.7, sales: 14200,
    badge: '',
    img: '⚽',
    tags: ['天然橡胶', '耐咬']
  },
  {
    id: 11, category: 'toy', petType: 'cat',
    name: '猫爬架多层豪华版',
    desc: '稳固结实 | 磨爪休憩一体',
    price: 298, originalPrice: 398,
    rating: 4.8, sales: 5600,
    badge: '热销',
    img: '🏠',
    tags: ['稳固', '大空间', '磨爪']
  },
  {
    id: 12, category: 'toy', petType: 'dog',
    name: '宠物益智漏食玩具',
    desc: '锻炼智力 | 减缓进食速度',
    price: 49, originalPrice: 72,
    rating: 4.6, sales: 8900,
    badge: '',
    img: '🎲',
    tags: ['益智', '减少狼吞虎咽']
  },
  // 家居用品
  {
    id: 13, category: 'home', petType: 'both',
    name: '宠物自动饮水机 2L',
    desc: '循环过滤 | 保持水质新鲜',
    price: 89, originalPrice: 129,
    rating: 4.8, sales: 22000,
    badge: '必备',
    img: '💧',
    tags: ['自动', '过滤', '安静']
  },
  {
    id: 14, category: 'home', petType: 'dog',
    name: '防打翻慢食碗套装（两件）',
    desc: '防滑设计 | 减缓进食防胀气',
    price: 55, originalPrice: 79,
    rating: 4.7, sales: 9200,
    badge: '',
    img: '🍜',
    tags: ['防滑', '防打翻']
  },
  {
    id: 15, category: 'home', petType: 'cat',
    name: '封闭式猫厕所 特大号',
    desc: '双层过滤 | 防臭防溅砂',
    price: 168, originalPrice: 228,
    rating: 4.9, sales: 18700,
    badge: '爆款',
    img: '🚽',
    tags: ['防臭', '防溅砂', '大空间']
  },
  {
    id: 16, category: 'home', petType: 'both',
    name: '宠物出行航空箱 M号',
    desc: '坚固透气 | 符合航空托运标准',
    price: 198, originalPrice: 280,
    rating: 4.7, sales: 7800,
    badge: '',
    img: '🧳',
    tags: ['航空标准', '透气', '安全']
  }
];

let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// 初始化商城
function initStore() {
  renderProducts();
  setupCategoryButtons();
  setupSearchAndSort();
  updateCartBadge();
}

// 获取筛选和排序后的商品列表
function getFilteredProducts() {
  let filtered = currentCategory === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === currentCategory);

  // 搜索过滤
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // 排序
  switch (currentSort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'sales':
      filtered.sort((a, b) => b.sales - a.sales);
      break;
  }

  return filtered;
}

// 渲染商品列表
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  if (!grid) return;

  const products = getFilteredProducts();

  if (products.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      <div class="product-img">${product.img}</div>
      <div class="product-info">
        <h4 class="product-name">${product.name}</h4>
        <p class="product-desc">${product.desc}</p>
        <div class="product-tags">
          ${product.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
          <span class="rating-num">${product.rating}</span>
          <span class="sales-num">已售 ${product.sales >= 10000 ? (product.sales/10000).toFixed(1)+'万' : product.sales}+</span>
        </div>
        <div class="product-price-row">
          <div class="product-price">
            <span class="price-now">¥${product.price}</span>
            <span class="price-original">¥${product.originalPrice}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart(${product.id})">
            <i class="fas fa-plus"></i> 加入购物车
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 设置分类按钮
function setupCategoryButtons() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

// 设置搜索和排序
function setupSearchAndSort() {
  const searchInput = document.getElementById('store-search-input');
  const sortSelect = document.getElementById('store-sort');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderProducts();
    });
  }
}

// 加入购物车
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  CartStore.add(product);
  updateCartBadge();
  showAddToCartAnimation(productId);
  showToast(`已将「${product.name}」加入购物车`);
}

// 更新购物车数量徽标
function updateCartBadge() {
  const total = CartStore.totalCount();
  const badge = document.querySelector('.cart-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// 加入购物车动画
function showAddToCartAnimation(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (!card) return;
  card.classList.add('added');
  setTimeout(() => card.classList.remove('added'), 600);
}

// 初始化
document.addEventListener('DOMContentLoaded', initStore);
