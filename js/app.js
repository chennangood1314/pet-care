

// 训练详情弹窗
function openTrainingDetail(type) {
  const data = {
    toilet: {
      title: '如厕训练 — 7天养成好习惯',
      steps: [
        '<strong>第1-2天：固定地点</strong> — 在指定位置铺尿垫或报纸，饭后/睡醒后立即带去。每次正确排便后给予零食奖励和表扬。',
        '<strong>第3-4天：定时引导</strong> — 建立固定排便时间（早晨起床后、饭后15分钟、睡前），用口令"上厕所"建立条件反射。',
        '<strong>第5-6天：减少引导</strong> — 逐渐让宠物自己去找排便点，只在旁观察。成功后加大奖励力度。',
        '<strong>第7天+：巩固习惯</strong> — 大多数宠物已形成习惯。若还有意外，不要惩罚，回到第3天重新训练。',
        '<strong>关键提示：</strong>幼犬忍耐时间=月龄+1小时；猫咪通常不需要训练，会自动使用猫砂盆。'
      ]
    },
    feeding: {
      title: '进食训练 — 建立正确用餐礼仪',
      steps: [
        '<strong>定时定量</strong> — 每天固定2-3次喂食，每次15-20分钟。没吃完的食物收走，不要一直放在碗里。',
        '<strong>餐前冷静</strong> — 准备食物时要求宠物坐下等待，食物放好并说"吃"才允许进食。扑人或吠叫时不给予食物。',
        '<strong>不随意喂食</strong> — 人类食物（尤其是巧克力、葡萄、洋葱、大蒜）对宠物有毒。零食不超过每日总食量的10%。',
        '<strong>防抢食训练</strong> — 进食时可轻碰食盆、轻声说话，让宠物习惯有人靠近。若有护食行为，请咨询专业训犬师。',
        '<strong>关键提示：</strong>幼犬每日3-4餐，成犬2餐；猫咪少食多餐更健康。'
      ]
    },
    social: {
      title: '社交训练 — 培养友好性格',
      steps: [
        '<strong>黄金窗口期</strong> — 狗狗3-16周龄是社交关键期。此阶段温和接触不同人、动物、环境，能极大减少成年后的恐惧和攻击行为。',
        '<strong>循序渐进</strong> — 先从安静环境开始，一次只引入一个新元素（陌生人→陌生狗→人多的地方）。每次15-20分钟，观察宠物反应。',
        '<strong>正面关联</strong> — 遇到新事物时给予零食奖励，让宠物形成"新东西=好事"的印象。如果宠物表现出恐惧，带离现场，下次从更远距离重新开始。',
        '<strong>读懂信号</strong> — 夹尾巴、飞机耳、打哈欠、舔嘴唇都是紧张信号。立即减少刺激强度。',
        '<strong>关键提示：</strong>没打完疫苗的幼犬不要接触陌生犬只和不洁地面。可选择安全环境进行社交。'
      ]
    }
  };
  const d = data[type];
  if (!d) return;
  document.getElementById('training-title').textContent = d.title;
  document.getElementById('training-body').innerHTML = d.steps.map(s => `<div style="background:#f8f9fa; border-radius:10px; padding:14px; margin-bottom:10px; font-size:14px; color:#444; line-height:1.7;">${s}</div>`).join('');
  const modal = document.getElementById('training-modal');
  modal.style.display = 'flex';
  modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
}

// 症状应对弹窗
function openSymptomDetail(name, level, advice) {
  document.getElementById('symptom-title').textContent = name;
  document.getElementById('symptom-advice').textContent = advice;
  const badge = document.getElementById('symptom-badge');
  const config = {
    mild: { text: '轻微', bg: '#e8f5e9', color: '#2e7d32' },
    moderate: { text: '中等', bg: '#fff3e0', color: '#e65100' },
    severe: { text: '紧急', bg: '#ffebee', color: '#c62828' }
  };
  const c = config[level] || config.mild;
  badge.textContent = c.text;
  badge.style.background = c.bg;
  badge.style.color = c.color;
  const modal = document.getElementById('symptom-modal');
  modal.style.display = 'flex';
  modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
}

window.openTrainingDetail = openTrainingDetail;
window.openSymptomDetail = openSymptomDetail;

// 主应用JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期显示
    updateCurrentDate();
    
    // 初始化导航栏
    initNavigation();
    
    // 初始化宠物类型选择
    initPetTypeSelection();
    
    // 初始化新手指南标签页
    initGuideTabs();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 显示欢迎通知
    const hasVisited = storage.get('hasVisited', false);
    if (!hasVisited) {
        storage.set('hasVisited', true);
        setTimeout(() => {
            showNotification('欢迎使用宠物新手助手！开始您的科学养宠之旅吧～');
        }, 1000);
    }
});

// 更新当前日期显示
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const dateStr = now.toLocaleDateString('zh-CN', options);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
}

// 初始化导航栏
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section');
    
    // 监听滚动，更新活动导航项
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // 平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// 初始化宠物类型选择
function initPetTypeSelection() {
    const petOptions = document.querySelectorAll('.pet-option');
    
    petOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有active类
            petOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加active类到点击的选项
            this.classList.add('active');
            
            // 获取宠物类型
            const petType = this.dataset.pet;
            
            // 显示选择通知
            showNotification(`已选择${this.querySelector('h3').textContent}养护模式`);
            
            // 保存宠物类型偏好
            storage.set('preferredPetType', petType);
            updateTasksByPetType(petType);
        });
    });
}

// 根据宠物类型更新任务
function updateTasksByPetType(petType) {
    console.log(`切换到${petType}养护模式`);
    // 实际应用中，这里会从服务器加载对应宠物类型的任务数据
}

// 初始化新手指南标签页
function initGuideTabs() {
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guidePanels = document.querySelectorAll('.guide-panel');
    
    guideTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 更新标签页状态
            guideTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的面板
            guidePanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tabId}-panel`) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// 初始化移动端菜单
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // 点击链接后关闭菜单
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    if (!notification || !messageElement) return;
    
    // 更新消息内容
    messageElement.textContent = message;
    
    // 更新图标和样式
    const icon = notification.querySelector('i');
    if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#ff9800';
    } else if (type === 'error') {
        icon.className = 'fas fa-times-circle';
        icon.style.color = '#f44336';
    } else {
        icon.className = 'fas fa-bell';
        icon.style.color = '#4CAF50';
    }
    
    // 显示通知
    notification.classList.add('active');
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('active');
    }, 5000);
    
    // 关闭按钮事件
    const closeBtn = document.getElementById('notification-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            notification.classList.remove('active');
        };
    }
}

// 安全的 localStorage 操作
const storage = {
    get(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            if (val === null) return fallback;
            try { return JSON.parse(val); }
            catch { return val; } // 非 JSON 字符串，返回原始值
        } catch (e) {
            console.error('storage.get error:', e);
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('storage.set error:', e);
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('storage.remove error:', e);
        }
    }
};

// 统一的购物车操作
const CartStore = {
    get() {
        return storage.get('cartItems', []);
    },
    set(items) {
        storage.set('cartItems', items);
    },
    add(item) {
        const items = this.get();
        const existing = items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            items.push({ ...item, quantity: item.quantity || 1 });
        }
        this.set(items);
    },
    remove(productId) {
        const items = this.get().filter(i => i.id !== productId);
        this.set(items);
    },
    updateQty(productId, quantity) {
        const items = this.get();
        const item = items.find(i => i.id === productId);
        if (item) item.quantity = quantity;
        this.set(items);
    },
    clear() {
        this.set([]);
    },
    totalCount() {
        return this.get().reduce((sum, i) => sum + i.quantity, 0);
    },
    totalPrice() {
        return this.get().reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    isEmpty() {
        return this.get().length === 0;
    }
};

// 工具函数：格式化价格
function formatPrice(price) {
    return '¥' + price.toFixed(2);
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 导航到指定页面区域
function navigateTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 70,
            behavior: 'smooth'
        });
    }
}

// 显示轻提示 (Toast)
function showToast(message) {
    // 移除已存在的 toast
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 28px;
        border-radius: 24px;
        font-size: 15px;
        z-index: 9999;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
        white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;

    // 注入动画样式（如果还没有）
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
            @keyframes toastOut { from { opacity:1; } to { opacity:0; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 导出全局函数
window.showNotification = showNotification;
window.formatPrice = formatPrice;
window.navigateTo = navigateTo;
window.showToast = showToast;
window.CartStore = CartStore;
window.storage = storage;