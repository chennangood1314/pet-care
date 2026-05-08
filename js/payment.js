// =============================================
// 支付模块
// =============================================

function initPayment() {
  // 返回购物车
  const backBtn = document.getElementById('back-to-cart');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateTo('store');
      openCartModal();
    });
  }

  // 确认支付
  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.addEventListener('click', processPayment);
  }
}

// 处理支付
function processPayment() {
  if (!cartItems || cartItems.length === 0) {
    showToast('购物车是空的！');
    return;
  }

  const method = document.querySelector('input[name="payment"]:checked');
  if (!method) {
    showToast('请选择支付方式');
    return;
  }

  const methodNames = {
    alipay: '支付宝',
    wechat: '微信支付',
    card: '银行卡'
  };

  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = '支付处理中...';
  }

  // 模拟支付过程（实际需接入支付SDK）
  showPaymentProcessing(methodNames[method.value]);

  setTimeout(() => {
    paymentSuccess();
  }, 2000);
}

// 显示支付处理中弹窗
function showPaymentProcessing(methodName) {
  const overlay = document.createElement('div');
  overlay.id = 'payment-overlay';
  overlay.innerHTML = `
    <div class="payment-processing-box">
      <div class="payment-spinner"></div>
      <p>正在通过 <strong>${methodName}</strong> 处理支付...</p>
      <p class="payment-hint">请稍候，不要关闭页面</p>
    </div>
  `;
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.6);
    display:flex; align-items:center; justify-content:center;
    z-index:9999;
  `;
  document.body.appendChild(overlay);
}

// 支付成功
function paymentSuccess() {
  const overlay = document.getElementById('payment-overlay');
  if (overlay) overlay.remove();

  const payBtn = document.getElementById('confirm-payment');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.textContent = '确认支付';
  }

  // 生成订单号
  const orderNo = 'PET' + Date.now().toString().slice(-10);

  // 清空购物车
  cartItems = [];
  saveCart();
  updateCartBadge();

  // 显示成功界面
  showOrderSuccess(orderNo);
}

// 显示订单成功页面
function showOrderSuccess(orderNo) {
  const main = document.querySelector('main');
  const successPage = document.createElement('div');
  successPage.id = 'order-success';
  successPage.innerHTML = `
    <div class="container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>支付成功！</h2>
        <p class="success-sub">感谢你对毛孩子的爱 🐾</p>
        <div class="order-info-box">
          <div class="info-row">
            <span>订单编号</span>
            <strong>${orderNo}</strong>
          </div>
          <div class="info-row">
            <span>预计送达</span>
            <strong>明天 18:00 前</strong>
          </div>
          <div class="info-row">
            <span>配送状态</span>
            <strong class="status-tag">待发货</strong>
          </div>
        </div>
        <div class="success-actions">
          <button class="btn btn-primary" onclick="goHome()">
            <i class="fas fa-home"></i> 返回首页
          </button>
          <button class="btn btn-secondary" onclick="navigateTo('store')">
            <i class="fas fa-store"></i> 继续购物
          </button>
        </div>
      </div>
    </div>
  `;
  successPage.style.cssText = `
    position:fixed; inset:0; background:#fff;
    z-index:999; overflow-y:auto;
    display:flex; align-items:center; justify-content:center;
  `;
  document.body.appendChild(successPage);
}

function goHome() {
  const success = document.getElementById('order-success');
  if (success) success.remove();
  navigateTo('home');
}

document.addEventListener('DOMContentLoaded', initPayment);
