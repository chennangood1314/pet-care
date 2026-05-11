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

    // 初始化 Hero 轮播
    initHeroSlideshow();

    // 初始化 AI 问诊
    initAIConsultation();

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
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
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

// ========== Hero 轮播 ==========
function initHeroSlideshow() {
    const slideshow = document.getElementById('hero-slideshow');
    const dotsContainer = document.getElementById('hero-dots');
    if (!slideshow || !dotsContainer) return;

    const slides = slideshow.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let current = 0;
    let timer;

    // 创建导航点
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        resetTimer();
    }

    function next() {
        goTo((current + 1) % slides.length);
    }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, 4000);
    }

    resetTimer();

    // 触摸滑动支持
    let touchStartX = 0;
    slideshow.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
    slideshow.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? goTo((current + 1) % slides.length) : goTo((current - 1 + slides.length) % slides.length);
        }
    });
}

// ========== AI 问诊 ==========
const AI_KNOWLEDGE = {
    '呕吐': {
        answer: '宠物呕吐可能由多种原因引起：\n\n1. <strong>进食过快</strong>：使用慢食碗，少量多餐\n2. <strong>食物不耐受</strong>：近期是否换粮？换粮需7天过渡\n3. <strong>吞入异物</strong>：检查玩具、是否有小物件缺失\n4. <strong>肠胃炎/胰腺炎</strong>：如持续呕吐+精神差\n\n🚨 <strong>需立即就医的情况：</strong>\n• 24小时内呕吐超过3次\n• 呕吐物带血（红色/咖啡色）\n• 伴随腹泻、精神萎靡、拒绝饮水\n• 幼犬/幼猫呕吐（脱水风险高）',
        tags: ['呕吐', '吐', '反胃', '恶心']
    },
    '腹泻': {
        answer: '宠物腹泻常见处理：\n\n1. <strong>禁食6-12小时</strong>（不禁水），让肠胃休息\n2. <strong>少量喂水</strong>，防止脱水\n3. <strong>恢复饮食</strong>：白水煮鸡胸肉+白米饭，清淡易消化\n4. <strong>益生菌</strong>调理肠道菌群\n\n🚨 <strong>需立即就医的情况：</strong>\n• 腹泻超过24小时\n• 便中带血（鲜红/暗红/黑色）\n• 幼宠腹泻超过12小时\n• 伴随呕吐、发烧、精神萎靡',
        tags: ['腹泻', '拉肚子', '拉稀', '软便', '便血']
    },
    '疫苗': {
        answer: '宠物疫苗接种计划：\n\n<strong>幼犬：</strong>\n• 第8周：第一针多联疫苗（犬六联）\n• 第12周：第二针多联疫苗\n• 第16周：第三针多联+狂犬疫苗\n• 每年：加强针各一针\n\n<strong>幼猫：</strong>\n• 第8周：第一针猫三联\n• 第12周：第二针猫三联\n• 第16周：第三针猫三联+狂犬\n• 每年：加强针\n\n⚠️ <strong>注意：</strong>疫苗后可能出现1-2天嗜睡、食欲差，属正常反应。如面部肿胀或严重呕吐需立即就医。',
        tags: ['疫苗', '打针', '防疫', '免疫', '狂犬', '多联']
    },
    '驱虫': {
        answer: '宠物驱虫方案：\n\n<strong>体外驱虫（跳蚤/蜱虫）：</strong>\n• 频率：每月一次\n• 方式：滴剂（后颈皮肤）或喷剂\n• 品牌参考：福来恩、大宠爱\n\n<strong>体内驱虫（蛔虫/绦虫等）：</strong>\n• 频率：每3个月一次\n• 方式：口服片剂\n• 品牌参考：拜耳、海乐妙\n\n<strong>心丝虫预防：</strong>\n• 从第12周开始，每月一次\n\n⚠️ 驱虫后注意观察便便是否有虫体排出。不同体重对应不同剂量，请按说明书使用。',
        tags: ['驱虫', '跳蚤', '蜱虫', '蛔虫', '心丝虫', '寄生虫']
    },
    '皮肤': {
        answer: '宠物皮肤问题分析：\n\n<strong>常见症状及原因：</strong>\n• 瘙痒+红斑 → 过敏（食物/环境）/真菌感染\n• 脱毛+皮屑 → 真菌（猫癣/狗癣）/螨虫\n• 局部结痂 → 细菌感染/外伤\n• 耳缘增厚+黑色分泌物 → 耳螨\n\n<strong>家庭处理：</strong>\n1. 戴伊丽莎白圈，防止舔咬加重\n2. 保持环境干燥清洁\n3. 不要自行使用人类药膏\n\n🚨 尽快就医确诊（可能需要皮肤镜检），不要拖延以免扩散。',
        tags: ['皮肤', '瘙痒', '脱毛', '皮屑', '猫癣', '狗癣', '过敏', '红斑', '湿疹']
    },
    '饮食': {
        answer: '宠物饮食营养指南：\n\n<strong>不能吃的食物（有毒！）：</strong>\n🍫 巧克力 → 心脏毒性\n🍇 葡萄/葡萄干 → 肾衰竭\n🧅 洋葱/大蒜 → 溶血性贫血\n🥑 牛油果 → 呕吐腹泻\n🍺 酒精/咖啡因 → 中毒\n🌰 木糖醇 → 低血糖/肝损伤\n\n<strong>每日喂食量参考：</strong>\n• 幼犬：体重的3-5%，分3-4餐\n• 成犬：体重的2-3%，分2餐\n• 零食不超过总食量的10%\n\n⚠️ 换粮需要7天过渡：旧粮比例从75%逐步减到0%。',
        tags: ['饮食', '食物', '喂食', '吃什么', '不能吃', '巧克力', '狗粮', '猫粮', '营养']
    },
    '行为': {
        answer: '宠物常见行为问题解答：\n\n<strong>乱咬东西：</strong>\n• 幼犬换牙期正常（3-6月龄）\n• 提供磨牙玩具，及时引导\n• 咬人时大叫一声停止互动，让ta知道"咬人=游戏结束"\n\n<strong>乱叫/吠叫：</strong>\n• 排除饥饿、需排便、无聊等原因\n• 不要惩罚，给予充足运动和精神刺激\n• 训练"安静"口令\n\n<strong>分离焦虑：</strong>\n• 笼内训练（建立安全区）\n• 短时间离开→逐渐延长\n• 离开/回来时不夸张互动\n\n<strong>乱拉乱尿：</strong>\n• 检查泌尿道感染（需兽医诊断）\n• 绝育可减少标记行为\n• 彻底清洁排泄区域（专用酶清洁剂）',
        tags: ['行为', '乱咬', '乱叫', '吠叫', '分离焦虑', '乱拉', '乱尿', '咬人', '扑人']
    },
    '老年': {
        answer: '老年宠物护理要点（小型犬>10岁/大型犬>8岁/猫>11岁）：\n\n<strong>饮食调整：</strong>\n• 换为老年配方粮（低磷、适量蛋白）\n• 补充关节保健品（葡萄糖胺、软骨素）\n• 控制体重（肥胖加重关节负担）\n\n<strong>体检频率：</strong>\n• 每6个月一次基础体检\n• 每年一次全面体检（血检+尿检+B超+X光）\n\n<strong>日常注意：</strong>\n• 防滑地面（老年犬猫容易髋关节问题）\n• 调整食盆/水盆高度\n• 注意口腔健康（牙结石→心脏病风险）\n• 观察饮水量和排尿量变化（肾脏病早期信号）',
        tags: ['老年', '老龄', '年纪大', '关节炎', '关节', '年检', '体检']
    },
    '绝育': {
        answer: '宠物绝育常见问题：\n\n<strong>推荐时间：</strong>\n• 犬：6-12月龄（大型犬稍晚）\n• 猫：5-8月龄\n\n<strong>益处：</strong>\n• 母犬/猫：预防子宫蓄脓、乳腺瘤\n• 公犬/猫：减少标记行为、降低前列腺疾病\n• 降低走失风险（减少寻找配偶行为）\n\n<strong>术后护理：</strong>\n• 戴伊丽莎白圈7-10天\n• 限制剧烈运动\n• 保持伤口干燥\n• 按时拆线（如需拆线）\n\n⚠️ 绝育前需禁食8小时、禁水4小时。',
        tags: ['绝育', '手术', '结扎', '阉割', '绝育手术', '做手术']
    },
    '洗澡': {
        answer: '宠物洗澡指南：\n\n<strong>洗澡频率：</strong>\n• 狗狗：2-4周一次（视品种和活动量）\n• 猫咪：一般不需要洗澡（猫咪自洁能力强），长毛猫可2-3月洗一次\n• 短毛室内猫：6个月-1年一次\n\n<strong>注意事项：</strong>\n• 使用宠物专用沐浴露（人用沐浴露pH不同会伤皮肤）\n• 水温37-39°C（用手肘试温）\n• 从后往前洗，头部最后\n• 耳朵塞棉花防进水\n• 彻底冲洗干净（残留沐浴露会导致瘙痒）\n• 吹干吹透（潮湿→皮肤病）\n\n⚠️ 疫苗后一周内、生病期间、刚吃饱时不要洗澡。',
        tags: ['洗澡', '清洁', '沐浴', '卫生', '臭味', '体味']
    }
};

function initAIConsultation() {
    const section = document.getElementById('ai-consultation');
    if (!section) return;

    const chatBody = document.getElementById('ai-chat-body');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const quickBtns = document.querySelectorAll('.ai-quick-btn');

    if (!chatBody) return;

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = 'ai-message ai-' + type;
        div.innerHTML = '<div class="ai-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'ai-message ai-bot ai-typing';
        div.innerHTML = '<div class="ai-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    function findAnswer(query) {
        const q = query.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;

        for (const [key, data] of Object.entries(AI_KNOWLEDGE)) {
            // 检查标题匹配
            if (q.includes(key)) return data;

            // 检查标签匹配
            for (const tag of data.tags) {
                if (q.includes(tag)) {
                    const score = tag.length;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = data;
                    }
                }
            }
        }
        return bestMatch;
    }

    function handleQuery(query) {
        if (!query.trim()) return;

        // 用户消息
        addMessage(query, 'user');

        // 显示输入中
        const typingEl = showTyping();
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        // 模拟AI思考
        setTimeout(() => {
            typingEl.remove();

            const result = findAnswer(query);
            if (result) {
                addMessage(result.answer, 'bot');
            } else {
                addMessage(
                    '感谢您的咨询！根据您的描述，建议：<br><br>'
                    + '1. <strong>观察记录</strong>：仔细记录宠物症状（出现时间、频率、严重程度）<br>'
                    + '2. <strong>基础检查</strong>：检查精神状态、食欲、饮水量、体温（正常38-39°C）<br>'
                    + '3. <strong>线上咨询</strong>：建议预约在线兽医进行视频问诊<br>'
                    + '4. <strong>及时就医</strong>：如症状持续或加重，请尽快到宠物医院就诊<br><br>'
                    + '💡 <strong>提示：</strong>您可以尝试描述具体症状（如：呕吐、腹泻、皮肤瘙痒、疫苗等），我会提供更有针对性的建议。',
                    'bot'
                );
            }

            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }, 1200 + Math.random() * 800);
    }

    // 发送按钮
    if (sendBtn && input) {
        sendBtn.addEventListener('click', () => handleQuery(input.value));
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery(input.value);
            }
        });
    }

    // 快捷问题
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => handleQuery(btn.textContent.trim()));
    });
}

// 点击弹窗遮罩关闭
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
});

// 导出全局函数
window.openTrainingDetail = openTrainingDetail;
window.openSymptomDetail = openSymptomDetail;
window.showNotification = showNotification;
window.formatPrice = formatPrice;
window.navigateTo = navigateTo;
window.showToast = showToast;
window.CartStore = CartStore;
window.storage = storage;
