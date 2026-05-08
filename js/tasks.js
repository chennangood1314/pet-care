// 任务管理JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化任务系统
    initTaskSystem();
    
    // 设置每日提醒
    setupDailyReminders();
});

// 任务数据
const tasksData = {
    dog: [
        {
            id: 'feed-morning',
            title: '早餐喂食',
            time: '08:00',
            icon: 'fa-utensils',
            description: '提供专用狗粮，注意份量控制',
            completed: false
        },
        {
            id: 'water-morning',
            title: '更换饮用水',
            time: '09:00',
            icon: 'fa-tint',
            description: '确保水源清洁新鲜',
            completed: false
        },
        {
            id: 'walk-morning',
            title: '晨间散步排便',
            time: '10:00',
            icon: 'fa-walking',
            description: '外出散步，促进排便',
            completed: false
        },
        {
            id: 'feed-noon',
            title: '午餐喂食',
            time: '13:00',
            icon: 'fa-utensils',
            description: '少量加餐或零食',
            completed: false
        },
        {
            id: 'play',
            title: '互动玩耍',
            time: '15:00',
            icon: 'fa-gamepad',
            description: '30分钟互动游戏',
            completed: false
        },
        {
            id: 'walk-evening',
            title: '晚间散步',
            time: '18:00',
            icon: 'fa-walking',
            description: '晚餐前散步排便',
            completed: false
        },
        {
            id: 'feed-evening',
            title: '晚餐喂食',
            time: '19:00',
            icon: 'fa-utensils',
            description: '主要一餐，份量充足',
            completed: false
        },
        {
            id: 'water-evening',
            title: '晚间补水',
            time: '21:00',
            icon: 'fa-tint',
            description: '睡前检查水碗',
            completed: false
        }
    ],
    cat: [
        {
            id: 'feed-morning-cat',
            title: '早餐喂食',
            time: '08:00',
            icon: 'fa-utensils',
            description: '提供猫粮，可搭配湿粮',
            completed: false
        },
        {
            id: 'water-morning-cat',
            title: '更换饮用水',
            time: '09:00',
            icon: 'fa-tint',
            description: '猫咪喜欢流动水',
            completed: false
        },
        {
            id: 'litter-clean',
            title: '清理猫砂',
            time: '10:00',
            icon: 'fa-toilet',
            description: '清理猫砂盆，保持卫生',
            completed: false
        },
        {
            id: 'play-cat',
            title: '互动玩耍',
            time: '15:00',
            icon: 'fa-gamepad',
            description: '逗猫棒等互动游戏',
            completed: false
        },
        {
            id: 'feed-evening-cat',
            title: '晚餐喂食',
            time: '19:00',
            icon: 'fa-utensils',
            description: '主要喂食时间',
            completed: false
        },
        {
            id: 'grooming',
            title: '梳毛护理',
            time: '20:00',
            icon: 'fa-spa',
            description: '每日梳毛，减少毛球',
            completed: false
        },
        {
            id: 'litter-check',
            title: '检查猫砂',
            time: '22:00',
            icon: 'fa-toilet',
            description: '睡前检查猫砂盆',
            completed: false
        }
    ]
};

// 初始化任务系统
function initTaskSystem() {
    // 加载默认任务（狗狗）
    loadTasks('dog');
    
    // 监听宠物类型变化
    document.querySelectorAll('.pet-option').forEach(option => {
        option.addEventListener('click', function() {
            const petType = this.dataset.pet;
            loadTasks(petType);
        });
    });
}

// 加载任务
function loadTasks(petType = 'dog') {
    const tasks = tasksData[petType] || tasksData.dog;
    const tasksContainer = document.querySelector('.tasks-container');
    
    if (!tasksContainer) return;
    
    // 清空容器
    tasksContainer.innerHTML = '';
    
    // 创建任务卡片
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
    
    // 更新进度
    updateProgress();
}

// 创建任务卡片
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    
    const statusClass = task.completed ? 'completed' : 'pending';
    const statusText = task.completed ? '已完成' : '待完成';
    
    card.innerHTML = `
        <div class="task-icon">
            <i class="fas ${task.icon}"></i>
        </div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-time"><i class="far fa-clock"></i> ${task.time}</div>
            <div class="task-description">${task.description}</div>
        </div>
        <div class="task-status ${statusClass}" data-completed="${task.completed}">
            ${statusText}
        </div>
    `;
    
    // 添加点击事件
    const statusElement = card.querySelector('.task-status');
    statusElement.addEventListener('click', function() {
        toggleTaskStatus(task.id, this);
    });
    
    return card;
}

// 切换任务状态
function toggleTaskStatus(taskId, statusElement) {
    const isCompleted = statusElement.dataset.completed === 'true';
    const newCompleted = !isCompleted;
    
    // 更新UI
    statusElement.dataset.completed = newCompleted;
    statusElement.textContent = newCompleted ? '已完成' : '待完成';
    statusElement.className = `task-status ${newCompleted ? 'completed' : 'pending'}`;
    
    // 更新进度
    updateProgress();
    
    // 显示通知
    const taskCard = statusElement.closest('.task-card');
    const taskTitle = taskCard.querySelector('.task-title').textContent;
    const message = newCompleted 
        ? `✅ 已完成：${taskTitle}` 
        : `🔄 已取消：${taskTitle}`;
    
    showNotification(message, newCompleted ? 'info' : 'warning');
    
    // 保存状态到本地存储
    saveTaskStatus(taskId, newCompleted);
}

// 更新进度
function updateProgress() {
    const taskCards = document.querySelectorAll('.task-card');
    const totalTasks = taskCards.length;
    let completedTasks = 0;
    
    taskCards.forEach(card => {
        const statusElement = card.querySelector('.task-status');
        if (statusElement.dataset.completed === 'true') {
            completedTasks++;
        }
    });
    
    // 计算进度百分比
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 更新UI
    const progressFill = document.getElementById('progress-fill');
    const completedTasksElement = document.getElementById('completed-tasks');
    const totalTasksElement = document.getElementById('total-tasks');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
        progressFill.textContent = `${progressPercent}%`;
    }
    
    if (completedTasksElement) {
        completedTasksElement.textContent = completedTasks;
    }
    
    if (totalTasksElement) {
        totalTasksElement.textContent = totalTasks;
    }
    
    // 如果全部完成，显示庆祝消息
    if (completedTasks === totalTasks && totalTasks > 0) {
        setTimeout(() => {
            showNotification('🎉 太棒了！今日所有养护任务已完成！', 'info');
        }, 500);
    }
}

// 保存任务状态到本地存储
function saveTaskStatus(taskId, completed) {
    try {
        const today = new Date().toDateString();
        const storageKey = `petTasks_${today}`;
        let tasksStatus = storage.get(storageKey, {});
        tasksStatus[taskId] = completed;
        storage.set(storageKey, tasksStatus);
    } catch (error) {
        console.error('保存任务状态失败:', error);
    }
}

// 加载任务状态从本地存储
function loadTaskStatus() {
    try {
        const today = new Date().toDateString();
        const storageKey = `petTasks_${today}`;
        return storage.get(storageKey, {});
    } catch (error) {
        console.error('加载任务状态失败:', error);
        return {};
    }
}

// 设置每日提醒
function setupDailyReminders() {
    // 检查是否为当天第一次访问
    const lastVisit = storage.get('lastVisitDate', '');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
        // 是新的一天，重置任务状态
        resetDailyTasks();
        storage.set('lastVisitDate', today);
        
        // 显示欢迎消息
        setTimeout(() => {
            showNotification('🌞 新的一天开始了！记得完成今日的养护任务哦～');
        }, 2000);
    } else {
        // 加载保存的任务状态
        const savedStatus = loadTaskStatus();
        applySavedStatus(savedStatus);
    }
    
    // 设置定时提醒
    setInterval(checkReminders, 60000); // 每分钟检查一次
}

// 重置每日任务
function resetDailyTasks() {
    // 清除当天的任务状态
    const today = new Date().toDateString();
    const storageKey = `petTasks_${today}`;
    storage.remove(storageKey);
    
    // 重置UI状态
    document.querySelectorAll('.task-status').forEach(statusElement => {
        statusElement.dataset.completed = 'false';
        statusElement.textContent = '待完成';
        statusElement.className = 'task-status pending';
    });
    
    // 更新进度
    updateProgress();
}

// 应用保存的状态
function applySavedStatus(savedStatus) {
    document.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.dataset.taskId;
        const statusElement = card.querySelector('.task-status');
        
        if (savedStatus[taskId] !== undefined) {
            const completed = savedStatus[taskId];
            statusElement.dataset.completed = completed;
            statusElement.textContent = completed ? '已完成' : '待完成';
            statusElement.className = `task-status ${completed ? 'completed' : 'pending'}`;
        }
    });
    
    updateProgress();
}

// 检查提醒
function checkReminders() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // 检查是否有即将开始或已过期的任务
    document.querySelectorAll('.task-card').forEach(card => {
        const timeElement = card.querySelector('.task-time');
        if (!timeElement) return;
        
        const timeText = timeElement.textContent;
        const taskTime = timeText.replace('⏰ ', '').trim();
        const taskTitle = card.querySelector('.task-title').textContent;
        const statusElement = card.querySelector('.task-status');
        const isCompleted = statusElement.dataset.completed === 'true';
        
        // 如果任务时间与当前时间匹配且未完成，显示提醒
        if (taskTime === currentTime && !isCompleted) {
            showNotification(`⏰ 提醒：${taskTitle}时间到了！`, 'warning');
        }
    });
}

// 导出函数
window.loadTasks = loadTasks;
window.updateProgress = updateProgress;