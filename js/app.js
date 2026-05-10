// 主应用JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期显示
    updateCurrentDate();

    // 初始化导航栏
    initNavigation();

    // 初始化新手指南标签页
    initGuideTabs();

    // 初始化移动端菜单
    initMobileMenu();

    // 初始化滚动动画
    initScrollAnimations();

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

    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
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

// 初始化新手指南标签页
function initGuideTabs() {
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guidePanels = document.querySelectorAll('.guide-panel');

    guideTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;

            guideTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

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

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }
}

// 初始化滚动渐入动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    if (!notification || !messageElement) return;

    messageElement.textContent = message;

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

    notification.classList.add('active');

    setTimeout(() => {
        notification.classList.remove('active');
    }, 5000);

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
            catch { return val; }
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
        white-space: normal;
        max-width: 90vw;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;

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

// ========== 训练详情弹窗 ==========
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
        },
        commands: {
            title: '基础口令训练 — 四大必备技能',
            steps: [
                '<strong>坐下（Sit）</strong> — 手持零食放于宠物鼻子上方，缓慢向头顶移动，宠物自然坐下时立即说出"坐下"并奖励。每天5-10分钟，3-5天掌握。',
                '<strong>趴下（Down）</strong> — 先让宠物坐下，再将零食从鼻子引向地面。宠物趴下瞬间说出"趴下"并奖励。如果宠物只低头不趴，用腿搭桥引导。',
                '<strong>等待（Stay）</strong> — 让宠物坐下/趴下，手掌朝向它说"等待"，后退1步。如未移动立即奖励。逐步增加距离和时间。刚开始每次只有2-3秒。',
                '<strong>过来（Come）</strong> — 在安静环境中蹲下张开手臂，用欢快语调说"过来"。宠物过来后大力表扬+零食。切忌用"过来"后惩罚宠物。',
                '<strong>关键提示：</strong>每次训练5-10分钟为宜，以成功结尾。使用高价值零食（鸡胸肉、奶酪粒）。在饭前训练效果更好。'
            ]
        },
        leash: {
            title: '牵引绳随行训练 — 告别爆冲',
            steps: [
                '<strong>装备准备</strong> — 使用胸背带（非项圈），牵引绳长度1.2-1.5米最佳。不要使用伸缩牵引绳进行训练。',
                '<strong>室内适应</strong> — 先让宠物在家中佩戴胸背带5-10分钟，用零食分散注意力。适应后挂上牵引绳在室内走动。',
                '<strong>"停-走"训练</strong> — 当宠物拉扯牵引绳时，立即停下来变成一棵"树"。只有当牵引绳变松时才继续走。重复此过程，让宠物学会：松绳=前进。',
                '<strong>方向变换</strong> — 在散步中突然转向，让宠物学会关注你的方向。转向前可用"走吧"口令提示。',
                '<strong>关键提示：</strong>每次散步前先在原地等待30秒让宠物冷静。暴躁出门会强化兴奋-爆冲循环。使用零食引导贴近位置（左侧标准位）。'
            ]
        },
        crate: {
            title: '笼内训练 — 打造安全港湾',
            steps: [
                '<strong>航空箱/围栏不是惩罚</strong> — 笼子是宠物的"房间"而非"监狱"。永远不要关笼子作为惩罚。让笼子成为有安全感的私人空间。',
                '<strong>逐步适应</strong> — 第1天：笼门敞开，里面放零食让宠物自由进出。第2-3天：宠物进去后关上门几秒钟立即打开。第4-5天：逐渐延长关门时间至5-10分钟。',
                '<strong>正向关联</strong> — 在笼中喂食、给磨牙玩具、铺舒适的垫子。让宠物觉得进笼=好事发生。可以放置一件有你气味的衣物。',
                '<strong>分离焦虑处理</strong> — 关门后先在笼边坐一会，然后短时间离开（1-2分钟），返回时不夸张地打招呼。逐步延长离开时间。',
                '<strong>关键提示：</strong>幼犬笼内时间不超过月龄+1小时。成犬不超过6-8小时连续关笼。确保笼内通风良好、有饮水。'
            ]
        }
    };

    const d = data[type];
    if (!d) return;

    document.getElementById('training-title').textContent = d.title;
    document.getElementById('training-body').innerHTML = d.steps.map(s =>
        `<div style="background:#f8f9fa; border-radius:10px; padding:14px; margin-bottom:10px; font-size:14px; color:#444; line-height:1.7;">${s}</div>`
    ).join('');

    const modal = document.getElementById('training-modal');
    modal.style.display = 'flex';
    modal.onclick = function(e) {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// ========== 症状应对弹窗 ==========
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
    modal.onclick = function(e) {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// 导出全局函数
window.openTrainingDetail = openTrainingDetail;
window.openSymptomDetail = openSymptomDetail;
window.showNotification = showNotification;
window.formatPrice = formatPrice;
window.navigateTo = navigateTo;
window.showToast = showToast;
window.CartStore = CartStore;
window.storage = storage;
