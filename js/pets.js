// 宠物管理JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化宠物系统
    initPetSystem();
});

// 宠物数据存储
let pets = [];

// 初始化宠物系统
function initPetSystem() {
    // 加载保存的宠物数据
    loadPets();
    
    // 初始化表单提交
    const petForm = document.getElementById('pet-form');
    if (petForm) {
        petForm.addEventListener('submit', handlePetFormSubmit);
    }
    
    // 初始化示例数据按钮（开发用）
    initSampleDataButton();
}

// 处理宠物表单提交
function handlePetFormSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const name = document.getElementById('pet-name').value.trim();
    const type = document.getElementById('pet-type').value;
    const breed = document.getElementById('pet-breed').value.trim();
    const age = document.getElementById('pet-age').value;
    
    // 验证数据
    if (!name || !type) {
        showNotification('请填写宠物名字和类型', 'warning');
        return;
    }
    
    // 创建宠物对象
    const pet = {
        id: Date.now().toString(),
        name: name,
        type: type,
        breed: breed || '未指定',
        age: age ? parseInt(age) : null,
        createdAt: new Date().toISOString(),
        lastFed: null,
        lastWalked: null,
        healthStatus: '良好',
        notes: []
    };
    
    // 添加到宠物列表
    addPet(pet);
    
    // 重置表单
    document.getElementById('pet-form').reset();
    
    // 显示成功消息
    showNotification(`✅ 成功添加宠物：${name}`, 'info');
    
    // 更新任务列表（根据宠物类型）
    updateTasksByPetType(type);
}

// 添加宠物
function addPet(pet) {
    pets.push(pet);
    savePets();
    renderPets();
}

// 删除宠物
function deletePet(petId) {
    const petIndex = pets.findIndex(p => p.id === petId);
    if (petIndex !== -1) {
        const petName = pets[petIndex].name;
        pets.splice(petIndex, 1);
        savePets();
        renderPets();
        showNotification(`🗑️ 已删除宠物：${petName}`, 'warning');
    }
}

// 保存宠物数据到本地存储
function savePets() {
    try {
        localStorage.setItem('userPets', JSON.stringify(pets));
    } catch (error) {
        console.error('保存宠物数据失败:', error);
    }
}

// 从本地存储加载宠物数据
function loadPets() {
    try {
        const savedPets = localStorage.getItem('userPets');
        if (savedPets) {
            pets = JSON.parse(savedPets);
            renderPets();
        } else {
            // 如果没有数据，显示示例数据
            loadSamplePets();
        }
    } catch (error) {
        console.error('加载宠物数据失败:', error);
        pets = [];
    }
}

// 加载示例宠物数据
function loadSamplePets() {
    pets = [
        {
            id: '1',
            name: '旺财',
            type: 'dog',
            breed: '金毛寻回犬',
            age: 24,
            createdAt: '2026-01-15T08:00:00Z',
            lastFed: '2026-03-29T19:00:00Z',
            lastWalked: '2026-03-29T18:30:00Z',
            healthStatus: '良好',
            notes: ['喜欢玩球', '对小朋友友好']
        },
        {
            id: '2',
            name: '咪咪',
            type: 'cat',
            breed: '英国短毛猫',
            age: 12,
            createdAt: '2026-02-20T10:00:00Z',
            lastFed: '2026-03-29T19:30:00Z',
            lastWalked: null,
            healthStatus: '良好',
            notes: ['喜欢高处', '怕生']
        }
    ];
    savePets();
    renderPets();
}

// 渲染宠物列表
function renderPets() {
    const petsContainer = document.getElementById('pets-container');
    if (!petsContainer) return;
    
    // 清空容器
    petsContainer.innerHTML = '';
    
    if (pets.length === 0) {
        // 显示空状态
        petsContainer.innerHTML = `
            <div class="empty-pets">
                <i class="fas fa-paw"></i>
                <p>还没有添加宠物，快来添加您的第一个小伙伴吧！</p>
            </div>
        `;
        return;
    }
    
    // 创建宠物卡片
    pets.forEach(pet => {
        const petCard = createPetCard(pet);
        petsContainer.appendChild(petCard);
    });
}

// 创建宠物卡片
function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.dataset.petId = pet.id;
    
    // 根据宠物类型选择图标
    let icon = 'fa-paw';
    if (pet.type === 'dog') icon = 'fa-dog';
    if (pet.type === 'cat') icon = 'fa-cat';
    if (pet.type === 'rabbit') icon = 'fa-rabbit';
    if (pet.type === 'hamster') icon = 'fa-otter';
    
    // 格式化最后活动时间
    let lastActivity = '暂无记录';
    if (pet.lastFed) {
        const lastFed = new Date(pet.lastFed);
        lastActivity = `最近喂食：${formatTimeAgo(lastFed)}`;
    }
    
    card.innerHTML = `
        <div class="pet-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="pet-info">
            <h4>${pet.name}</h4>
            <p>${getPetTypeName(pet.type)} · ${pet.breed}</p>
            <p>年龄：${pet.age ? `${pet.age}个月` : '未知'}</p>
            <p>健康状况：<span class="health-status ${pet.healthStatus === '良好' ? 'good' : 'warning'}">${pet.healthStatus}</span></p>
            <p class="last-activity">${lastActivity}</p>
        </div>
        <div class="pet-actions">
            <button class="btn-small btn-feeding" data-action="feeding" title="记录喂食">
                <i class="fas fa-utensils"></i>
            </button>
            <button class="btn-small btn-walking" data-action="walking" title="记录散步">
                <i class="fas fa-walking"></i>
            </button>
            <button class="btn-small btn-delete" data-action="delete" title="删除宠物">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // 添加事件监听器
    const actions = card.querySelectorAll('.btn-small');
    actions.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.dataset.action;
            handlePetAction(pet.id, action);
        });
    });
    
    // 点击卡片查看详情
    card.addEventListener('click', function() {
        showPetDetails(pet);
    });
    
    return card;
}

// 处理宠物操作
function handlePetAction(petId, action) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    switch (action) {
        case 'feeding':
            pet.lastFed = new Date().toISOString();
            savePets();
            renderPets();
            showNotification(`🍖 已记录${pet.name}的喂食时间`, 'info');
            break;
            
        case 'walking':
            pet.lastWalked = new Date().toISOString();
            savePets();
            renderPets();
            showNotification(`🚶 已记录${pet.name}的散步时间`, 'info');
            break;
            
        case 'delete':
            if (confirm(`确定要删除宠物"${pet.name}"吗？此操作不可撤销。`)) {
                deletePet(petId);
            }
            break;
    }
}

// 显示宠物详情
function showPetDetails(pet) {
    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content pet-details-modal">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> ${pet.name}的详情</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="pet-detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">宠物类型：</span>
                        <span class="detail-value">${getPetTypeName(pet.type)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">品种：</span>
                        <span class="detail-value">${pet.breed}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">年龄：</span>
                        <span class="detail-value">${pet.age ? `${pet.age}个月` : '未知'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">健康状况：</span>
                        <span class="detail-value health-status ${pet.healthStatus === '良好' ? 'good' : 'warning'}">${pet.healthStatus}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">加入时间：</span>
                        <span class="detail-value">${formatDate(pet.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">最近喂食：</span>
                        <span class="detail-value">${pet.lastFed ? formatTimeAgo(new Date(pet.lastFed)) : '暂无记录'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">最近散步：</span>
                        <span class="detail-value">${pet.lastWalked ? formatTimeAgo(new Date(pet.lastWalked)) : '暂无记录'}</span>
                    </div>
                </div>
                
                ${pet.notes && pet.notes.length > 0 ? `
                <div class="pet-notes">
                    <h4>特别注意事项：</h4>
                    <ul>
                        ${pet.notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="pet-actions-full">
                    <button class="btn btn-primary" data-action="feeding">
                        <i class="fas fa-utensils"></i> 记录喂食
                    </button>
                    <button class="btn btn-secondary" data-action="walking">
                        <i class="fas fa-walking"></i> 记录散步
                    </button>
                    <button class="btn btn-outline" data-action="edit">
                        <i class="fas fa-edit"></i> 编辑信息
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听器
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击遮罩层关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 详情页中的操作按钮
    const actionButtons = modal.querySelectorAll('.pet-actions-full button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            if (action === 'feeding' || action === 'walking') {
                handlePetAction(pet.id, action);
                document.body.removeChild(modal);
            } else if (action === 'edit') {
                // 编辑功能待实现
                showNotification('编辑功能开发中...', 'info');
            }
        });
    });
}

// 工具函数：获取宠物类型名称
function getPetTypeName(type) {
    const typeNames = {
        dog: '狗狗',
        cat: '猫咪',
        rabbit: '兔子',
        hamster: '仓鼠',
        other: '其他宠物'
    };
    return typeNames[type] || '宠物';
}

// 工具函数：格式化时间差
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else {
        return `${diffDays}天前`;
    }
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 初始化示例数据按钮
function initSampleDataButton() {
    // 在宠物列表区域添加示例数据按钮
    const petList = document.querySelector('.pet-list');
    if (petList && pets.length === 0) {
        const sampleBtn = document.createElement('button');
        sampleBtn.className = 'btn btn-outline';
        sampleBtn.innerHTML = '<i class="fas fa-magic"></i> 加载示例数据';
        sampleBtn.style.marginTop = '20px';
        sampleBtn.addEventListener('click', loadSamplePets);
        petList.appendChild(sampleBtn);
    }
}

// 导出函数
window.addPet = addPet;
window.deletePet = deletePet;
window.loadPets = loadPets;