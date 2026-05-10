// 任务管理JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    initTaskSystem();
    setupDailyReminders();
});

// 任务数据
const tasksData = {
    dog: [
        { id: 'feed-morning', title: '早餐喂食', time: '08:00', icon: 'fa-utensils', description: '提供专用狗粮，注意份量控制', completed: false },
        { id: 'water-morning', title: '更换饮用水', time: '09:00', icon: 'fa-tint', description: '确保水源清洁新鲜', completed: false },
        { id: 'walk-morning', title: '晨间散步排便', time: '10:00', icon: 'fa-walking', description: '外出散步，促进排便', completed: false },
        { id: 'feed-noon', title: '午餐喂食', time: '13:00', icon: 'fa-utensils', description: '少量加餐或零食', completed: false },
        { id: 'play', title: '互动玩耍', time: '15:00', icon: 'fa-gamepad', description: '30分钟互动游戏', completed: false },
        { id: 'walk-evening', title: '晚间散步', time: '18:00', icon: 'fa-walking', description: '晚餐前散步排便', completed: false },
        { id: 'feed-evening', title: '晚餐喂食', time: '19:00', icon: 'fa-utensils', description: '主要一餐，份量充足', completed: false },
        { id: 'water-evening', title: '晚间补水', time: '21:00', icon: 'fa-tint', description: '睡前检查水碗', completed: false }
    ],
    cat: [
        { id: 'feed-morning-cat', title: '早餐喂食', time: '08:00', icon: 'fa-utensils', description: '提供猫粮，可搭配湿粮', completed: false },
        { id: 'water-morning-cat', title: '更换饮用水', time: '09:00', icon: 'fa-tint', description: '猫咪喜欢流动水', completed: false },
        { id: 'litter-clean', title: '清理猫砂', time: '10:00', icon: 'fa-toilet', description: '清理猫砂盆，保持卫生', completed: false },
        { id: 'play-cat', title: '互动玩耍', time: '15:00', icon: 'fa-gamepad', description: '逗猫棒等互动游戏', completed: false },
        { id: 'feed-evening-cat', title: '晚餐喂食', time: '19:00', icon: 'fa-utensils', description: '主要喂食时间', completed: false },
        { id: 'grooming', title: '梳毛护理', time: '20:00', icon: 'fa-spa', description: '每日梳毛，减少毛球', completed: false },
        { id: 'litter-check', title: '检查猫砂', time: '22:00', icon: 'fa-toilet', description: '睡前检查猫砂盆', completed: false }
    ],
    other: [
        { id: 'feed-other-morning', title: '早餐喂食', time: '08:00', icon: 'fa-utensils', description: '提供专用饲料/草料，注意份量', completed: false },
        { id: 'water-other', title: '更换饮用水', time: '09:00', icon: 'fa-tint', description: '确保饮水器清洁', completed: false },
        { id: 'cage-clean', title: '清理笼舍', time: '10:00', icon: 'fa-broom', description: '清理便便，更换垫材', completed: false },
        { id: 'enrichment', title: '丰容活动', time: '15:00', icon: 'fa-gamepad', description: '提供磨牙玩具或活动设施', completed: false },
        { id: 'feed-other-evening', title: '晚餐喂食', time: '19:00', icon: 'fa-utensils', description: '补充干草/饲料', completed: false },
        { id: 'health-check', title: '健康检查', time: '21:00', icon: 'fa-heartbeat', description: '观察精神状态、便便、毛发', completed: false }
    ]
};

// 初始化任务系统
function initTaskSystem() {
    // 恢复上次选择的宠物类型
    const preferredType = storage.get('preferredPetType', 'dog');
    loadTasks(preferredType);

    // 恢复宠物选项的 active 状态
    document.querySelectorAll('.pet-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.pet === preferredType);
    });

    // 监听宠物类型变化
    document.querySelectorAll('.pet-option').forEach(option => {
        option.addEventListener('click', function() {
            const petType = this.dataset.pet;

            // 切换 active 状态
            document.querySelectorAll('.pet-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // 保存偏好
            storage.set('preferredPetType', petType);

            // 加载对应任务
            loadTasks(petType);

            // 提示
            const petName = this.querySelector('h3')?.textContent || petType;
            if (petType === 'other') {
                showToast('小宠物养护指南开发中，当前展示狗狗任务供参考');
            } else {
                showToast(`已切换到${petName}养护模式`);
            }
        });
    });

    // 更新连续打卡
    updateStreak();
}

// 加载任务
function loadTasks(petType) {
    // "other" 类型暂用 dog 数据
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

    // 加载保存的状态
    const savedStatus = loadTaskStatus();
    if (Object.keys(savedStatus).length > 0) {
        applySavedStatus(savedStatus);
    }

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

    // 点击切换任务状态
    const statusElement = card.querySelector('.task-status');
    statusElement.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleTaskStatus(task.id, this);
    });

    return card;
}

// 切换任务状态
function toggleTaskStatus(taskId, statusElement) {
    const isCompleted = statusElement.dataset.completed === 'true';
    const newCompleted = !isCompleted;

    // 更新UI
    statusElement.dataset.completed = String(newCompleted);
    statusElement.textContent = newCompleted ? '已完成' : '待完成';
    statusElement.className = `task-status ${newCompleted ? 'completed' : 'pending'}`;

    // 更新进度
    updateProgress();

    // 显示通知
    const taskCard = statusElement.closest('.task-card');
    const taskTitle = taskCard.querySelector('.task-title').textContent;
    showToast(newCompleted ? `已完成：${taskTitle}` : `已取消：${taskTitle}`);

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
        if (statusElement && statusElement.dataset.completed === 'true') {
            completedTasks++;
        }
    });

    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const progressFill = document.getElementById('progress-fill');
    const completedTasksElement = document.getElementById('completed-tasks');
    const totalTasksElement = document.getElementById('total-tasks');

    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
        progressFill.textContent = `${progressPercent}%`;
        if (progressPercent >= 100) {
            progressFill.classList.add('full');
        } else {
            progressFill.classList.remove('full');
        }
    }
    if (completedTasksElement) completedTasksElement.textContent = completedTasks;
    if (totalTasksElement) totalTasksElement.textContent = totalTasks;

    // 全部完成时更新连续打卡
    if (completedTasks === totalTasks && totalTasks > 0) {
        updateStreak(true);
        setTimeout(() => {
            showToast('太棒了！今日所有养护任务已完成！');
        }, 300);
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
    const lastVisit = storage.get('lastVisitDate', '');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
        // 新的一天，重置任务状态
        resetDailyTasks();
        storage.set('lastVisitDate', today);

        setTimeout(() => {
            showNotification('新的一天开始了！记得完成今日的养护任务哦～');
        }, 2000);
    }

    // 每分钟检查一次提醒
    setInterval(checkReminders, 60000);
}

// 重置每日任务
function resetDailyTasks() {
    const today = new Date().toDateString();
    const storageKey = `petTasks_${today}`;
    storage.remove(storageKey);

    document.querySelectorAll('.task-status').forEach(statusElement => {
        statusElement.dataset.completed = 'false';
        statusElement.textContent = '待完成';
        statusElement.className = 'task-status pending';
    });

    updateProgress();
}

// 应用保存的状态
function applySavedStatus(savedStatus) {
    document.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.dataset.taskId;
        const statusElement = card.querySelector('.task-status');

        if (savedStatus[taskId] !== undefined && statusElement) {
            const completed = savedStatus[taskId];
            statusElement.dataset.completed = String(completed);
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
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    document.querySelectorAll('.task-card').forEach(card => {
        const timeElement = card.querySelector('.task-time');
        if (!timeElement) return;

        const timeText = timeElement.textContent.replace(/[^0-9:]/g, '').trim();
        const statusElement = card.querySelector('.task-status');
        if (!statusElement || statusElement.dataset.completed === 'true') return;

        if (timeText === currentTime) {
            const taskTitle = card.querySelector('.task-title').textContent;
            showNotification(`提醒：${taskTitle}时间到了！`, 'warning');
        }
    });
}

// 连续打卡管理
function updateStreak(todayCompleted) {
    const today = new Date().toDateString();
    const streakData = storage.get('streakData', { lastDate: '', count: 0 });

    if (todayCompleted) {
        if (streakData.lastDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (streakData.lastDate === yesterday) {
            streakData.count += 1;
        } else if (streakData.lastDate !== today) {
            streakData.count = 1;
        }
        streakData.lastDate = today;
        storage.set('streakData', streakData);
    }

    const streakInfo = document.getElementById('streak-info');
    const streakDays = document.getElementById('streak-days');
    if (streakInfo && streakDays && streakData.count > 0) {
        streakDays.textContent = streakData.count;
        streakInfo.style.display = 'block';
    } else if (streakInfo && streakData.count === 0) {
        streakInfo.style.display = 'none';
    }
}

window.loadTasks = loadTasks;
window.updateProgress = updateProgress;
