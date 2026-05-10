// =============================================
// 支付模块 - 完整支付流程
// 下单 → 模拟支付 → 订单历史
// =============================================

const PAYMENT_CONFIG = {
  pollInterval: 2000,
  expireMinutes: 15,
  apiBase: '/api'
};

let paymentTimer = null;

function initPayment() {
  const backBtn = document.getElementById('back-to-cart');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateTo('store');
      setTimeout(() => openCartModal(), 300);
    });
  }

  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.addEventListener('click', startPayment);
  }
}

// 开始支付流程
async function startPayment() {
  if (CartStore.isEmpty()) {
    showToast('购物车是空的！');
    return;
  }

  // 收集收货信息
  const userName = document.getElementById('user-name')?.value.trim();
  const userPhone = document.getElementById('user-phone')?.value.trim();
  if (!userName || !userPhone) {
    showToast('请填写收货人姓名和手机号码');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(userPhone)) {
    showToast('请输入正确的手机号码');
    return;
  }

  const methodInput = document.querySelector('input[name="payment"]:checked');
  if (!methodInput) {
    showToast('请选择支付方式');
    return;
  }

  const payMethod = methodInput.value;
  const methodNames = { alipay: '支付宝', wechat: '微信支付', card: '银行卡' };

  // 计算金额
  const subtotal = CartStore.totalPrice();
  const shipping = subtotal >= 199 ? 0 : 10;
  const total = subtotal + shipping;

  const payBtn = document.getElementById('confirm-payment');
  payBtn.disabled = true;
  payBtn.textContent = '正在创建订单...';

  try {
    // 始终调用 API 创建订单
    const response = await fetch(`${PAYMENT_CONFIG.apiBase}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: CartStore.get().map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total,
        payMethod,
        userInfo: { name: userName, phone: userPhone }
      })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    const orderData = result.data;

    // 显示支付弹窗
    showPaymentModal(orderData, payMethod, methodNames[payMethod]);

  } catch (error) {
    console.error('创建订单失败:', error);
    showToast('订单创建失败，请稍后重试');
    payBtn.disabled = false;
    payBtn.textContent = '确认支付';
  }
}

// 显示支付弹窗
function showPaymentModal(orderData, payMethod, methodName) {
  const existing = document.getElementById('payment-modal');
  if (existing) existing.remove();

  const methodIcons = { alipay: 'fa-alipay', wechat: 'fa-weixin', card: 'fa-credit-card' };
  const methodColors = { alipay: '#1677FF', wechat: '#07C160', card: '#FF6B35' };

  const iconClass = methodIcons[payMethod] || 'fa-credit-card';
  const color = methodColors[payMethod] || '#4CAF50';
  const expiredTime = new Date(orderData.expiresAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.innerHTML = `
    <div class="payment-modal-overlay"></div>
    <div class="payment-modal-box">
      <button class="payment-modal-close" id="payment-modal-close">&times;</button>

      <div class="payment-modal-header">
        <i class="fab ${iconClass}" style="color:${color}; font-size:36px;"></i>
        <h3>${methodName}支付</h3>
      </div>

      <div class="payment-modal-amount">
        <span class="amount-label">支付金额</span>
        <span class="amount-value">¥${orderData.total.toFixed(2)}</span>
      </div>

      <div class="payment-modal-qr">
        <div class="qr-container">
          <div class="qr-placeholder">
            <i class="fab ${iconClass}" style="font-size:60px; color:${color};"></i>
            <p>演示模式 · 模拟支付</p>
          </div>
        </div>
        <div class="qr-timer" id="qr-timer">
          <i class="fas fa-clock"></i>
          <span>请在 ${expiredTime} 前完成支付</span>
        </div>
      </div>

      <div class="payment-modal-info">
        <div class="info-row">
          <span>订单编号</span>
          <strong>${orderData.orderNo}</strong>
        </div>
      </div>

      <div class="payment-modal-actions">
        <button class="btn btn-primary btn-block" id="simulate-pay-btn">
          <i class="fas fa-check-circle"></i> 模拟支付成功
        </button>
        <button class="btn btn-secondary btn-block" id="simulate-fail-btn">
          <i class="fas fa-times-circle"></i> 模拟支付失败
        </button>
        <button class="btn btn-text btn-block" id="cancel-pay-btn">
          取消支付
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // 事件绑定
  document.getElementById('payment-modal-close').addEventListener('click', () => cancelPayment(orderData.orderNo));
  document.getElementById('cancel-pay-btn').addEventListener('click', () => cancelPayment(orderData.orderNo));

  // 模拟支付成功 → 调用 PATCH API 更新服务端状态
  document.getElementById('simulate-pay-btn').addEventListener('click', async () => {
    try {
      await fetch(`${PAYMENT_CONFIG.apiBase}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo: orderData.orderNo, action: 'pay' })
      });
    } catch (e) { /* 即使 API 失败也继续 */ }
    completePayment(orderData.orderNo, 'success');
  });

  // 模拟支付失败
  document.getElementById('simulate-fail-btn').addEventListener('click', () => {
    completePayment(orderData.orderNo, 'fail');
  });

  // 倒计时
  startPaymentTimer(orderData);
}

// 取消支付
async function cancelPayment(orderNo) {
  stopAllTimers();
  closePaymentModal();
  // 通知服务端取消
  try {
    await fetch(`${PAYMENT_CONFIG.apiBase}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNo, action: 'cancel' })
    });
  } catch (e) { /* 静默失败 */ }

  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.textContent = '确认支付';
  }
  showToast('已取消支付');
}

// 完成支付
function completePayment(orderNo, result) {
  stopAllTimers();
  closePaymentModal();

  if (result === 'success') {
    saveOrderToHistory(orderNo);
    CartStore.clear();
    updateCartBadge();
    showOrderSuccessPage(orderNo);
  } else {
    const payBtn = document.getElementById('confirm-payment');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = '确认支付';
    }
    showToast('支付失败，请重试');
  }
}

// 支付倒计时
function startPaymentTimer(orderData) {
  const timerEl = document.getElementById('qr-timer');
  if (!timerEl) return;

  const updateTimer = () => {
    const remaining = orderData.expiresAt - Date.now();
    if (remaining <= 0) {
      stopAllTimers();
      closePaymentModal();
      showToast('订单已过期，请重新下单');
      const payBtn = document.getElementById('confirm-payment');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = '确认支付';
      }
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.innerHTML = `
      <i class="fas fa-clock"></i>
      <span>剩余支付时间：${mins}:${secs.toString().padStart(2, '0')}</span>
    `;
  };
  updateTimer();
  paymentTimer = setInterval(updateTimer, 1000);
}

function stopAllTimers() {
  if (paymentTimer) { clearInterval(paymentTimer); paymentTimer = null; }
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.textContent = '确认支付';
  }
}

// 显示支付成功页
function showOrderSuccessPage(orderNo) {
  const main = document.querySelector('main');
  const existing = document.getElementById('order-success');
  if (existing) existing.remove();

  const page = document.createElement('div');
  page.id = 'order-success';
  page.innerHTML = `
    <div class="container" style="max-width:600px; padding:40px 20px;">
      <div class="success-card" style="text-align:center; background:white; padding:50px; border-radius:16px; box-shadow:0 5px 30px rgba(0,0,0,0.08);">
        <div style="font-size:72px; color:#4CAF50; margin-bottom:20px;">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="margin-bottom:10px; color:#333;">支付成功！</h2>
        <p style="color:#666; margin-bottom:30px;">感谢你对毛孩子的爱</p>

        <div style="background:#f8f9fa; border-radius:12px; padding:20px; margin-bottom:30px; text-align:left;">
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
            <span style="color:#888;">订单编号</span>
            <strong>${orderNo}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
            <span style="color:#888;">预计送达</span>
            <strong>明天 18:00 前</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0;">
            <span style="color:#888;">配送状态</span>
            <strong style="color:#ff9800;">待发货</strong>
          </div>
        </div>

        <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="goHome()">
            <i class="fas fa-home"></i> 返回首页
          </button>
          <button class="btn btn-secondary" style="border:2px solid #4CAF50; color:#4CAF50;" onclick="navigateTo('store')">
            <i class="fas fa-store"></i> 继续购物
          </button>
          <button class="btn btn-outline" onclick="showOrderHistory()" style="border:1px solid #ddd;">
            <i class="fas fa-list"></i> 查看订单
          </button>
        </div>
      </div>
    </div>
  `;
  page.style.cssText = 'position:fixed; inset:0; background:#f5f7fa; z-index:999; overflow-y:auto;';
  document.body.appendChild(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 保存订单到历史记录
function saveOrderToHistory(orderNo) {
  const orders = storage.get('orderHistory', []);
  const items = CartStore.get();
  const userName = document.getElementById('user-name')?.value || '';
  const userPhone = document.getElementById('user-phone')?.value || '';
  const payMethod = document.querySelector('input[name="payment"]:checked')?.value || '';

  orders.unshift({
    orderNo,
    items: items.map(i => ({ id: i.id, name: i.name, img: i.img, price: i.price, quantity: i.quantity })),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    payMethod,
    userName,
    userPhone,
    status: 'paid',
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString()
  });
  storage.set('orderHistory', orders.slice(0, 50));
}

// 查看订单历史
function showOrderHistory() {
  const successPage = document.getElementById('order-success');
  if (successPage) successPage.remove();

  const orders = storage.get('orderHistory', []);

  const main = document.querySelector('main');
  const existing = document.getElementById('order-history');
  if (existing) existing.remove();

  const page = document.createElement('div');
  page.id = 'order-history';

  if (orders.length === 0) {
    page.innerHTML = `
      <div class="container" style="max-width:600px; padding:60px 20px; text-align:center;">
        <div style="font-size:64px; color:#ddd; margin-bottom:20px;">
          <i class="fas fa-receipt"></i>
        </div>
        <h3 style="color:#999; margin-bottom:20px;">还没有订单</h3>
        <button class="btn btn-primary" onclick="document.getElementById('order-history').remove(); navigateTo('store');">去购物</button>
      </div>
    `;
  } else {
    page.innerHTML = `
      <div class="container" style="max-width:800px; padding:40px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
          <h2 style="margin:0;"><i class="fas fa-list"></i> 我的订单</h2>
          <button class="btn btn-text" onclick="document.getElementById('order-history').remove();" style="color:#666;">
            <i class="fas fa-times"></i> 关闭
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:15px;">
          ${orders.map(order => `
            <div class="order-card" style="background:white; border-radius:12px; padding:20px; box-shadow:0 3px 15px rgba(0,0,0,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div>
                  <strong style="font-size:16px;">订单号：${order.orderNo}</strong>
                  <p style="color:#888; font-size:13px; margin:4px 0 0;">${new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                <span style="background:#e8f5e9; color:#4CAF50; padding:4px 12px; border-radius:20px; font-size:13px;">已支付</span>
              </div>
              <div style="border-top:1px solid #f0f0f0; padding-top:12px;">
                ${order.items.map(i => `
                  <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px; color:#666;">
                    <span><img src="${i.img}" alt="${i.name}" style="width:24px;height:24px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:6px;">${i.name} x${i.quantity}</span>
                    <span>¥${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
              <div style="border-top:1px solid #f0f0f0; padding-top:12px; margin-top:12px; display:flex; justify-content:space-between; font-size:16px;">
                <strong>合计</strong>
                <strong style="color:#ff4444;">¥${order.total.toFixed(2)}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  page.style.cssText = 'position:fixed; inset:0; background:#f5f7fa; z-index:999; overflow-y:auto;';
  document.body.appendChild(page);
}

// 返回首页
function goHome() {
  const success = document.getElementById('order-success');
  if (success) success.remove();
  const history = document.getElementById('order-history');
  if (history) history.remove();
  navigateTo('home');
}

window.goHome = goHome;
window.showOrderHistory = showOrderHistory;

document.addEventListener('DOMContentLoaded', initPayment);
