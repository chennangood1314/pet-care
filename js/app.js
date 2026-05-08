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
    setTimeout(() => {
        showNotification('欢迎使用宠物新手助手！开始您的科学养宠之旅吧～');
    }, 1000);
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
            
            // 这里可以添加根据宠物类型加载不同数据的逻辑
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

// 模拟API请求
async function simulateAPIRequest(endpoint, data = null) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`API请求: ${endpoint}`, data);
            // 模拟成功响应
            resolve({ success: true, data: {} });
        }, 500);
    });
}

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

// 导出全局函数
window.showNotification = showNotification;
window.formatPrice = formatPrice;