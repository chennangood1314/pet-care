// =============================================
// 购物车模块
// =============================================

function initCart() {
  // 购物车图标点击
  const cartIcon = document.querySelector('.nav-cart a');
  if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
      openCartModal();
    });
  }

  // 关闭购物车
  const closeBtn = document.getElementById('cart-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartModal);
  }

  // 点击遮罩关闭
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCartModal();
    });
  }

  // 去结算按钮
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (CartStore.isEmpty()) {
        showToast('购物车是空的，先去选购商品吧！');
        return;
      }
      closeCartModal();
      navigateTo('checkout');
      renderOrderSummary();
    });
  }
}

// 打开购物车弹窗
function openCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  renderCartBody();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// 关闭购物车弹窗
function closeCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// 渲染购物车内容
function renderCartBody() {
  const cartBody = document.getElementById('cart-body');
  const totalEl = document.querySelector('.total-amount');
  if (!cartBody) return;

  const items = CartStore.get();

  if (items.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-basket"></i>
        <p>购物车还是空的哦~</p>
        <button class="btn btn-primary" onclick="closeCartModal(); navigateTo('store');">去逛逛</button>
      </div>
    `;
    if (totalEl) totalEl.textContent = '¥0.00';
    return;
  }

  let total = 0;
  cartBody.innerHTML = items.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}" width="48" height="48" loading="lazy"></div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">¥${item.price}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="cart-item-del" onclick="removeFromCart(${item.id})" title="删除">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.textContent = `¥${total.toFixed(2)}`;
}

// 修改数量
function changeQty(productId, delta) {
  const items = CartStore.get();
  const item = items.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    CartStore.remove(productId);
  } else {
    CartStore.updateQty(productId, item.quantity);
  }
  updateCartBadge();
  renderCartBody();
}

// 删除商品
function removeFromCart(productId) {
  CartStore.remove(productId);
  updateCartBadge();
  renderCartBody();
}

// 渲染订单确认页
function renderOrderSummary() {
  const orderItems = document.getElementById('order-items');
  if (!orderItems) return;

  const items = CartStore.get();
  let subtotal = 0;

  orderItems.innerHTML = items.map(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    return `
      <div class="order-item">
        <span class="order-item-img"><img src="${item.img}" alt="${item.name}" width="40" height="40" loading="lazy"></span>
        <div class="order-item-detail">
          <span class="order-item-name">${item.name}</span>
          <span class="order-item-qty">x${item.quantity}</span>
        </div>
        <span class="order-item-price">¥${lineTotal.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  const shipping = subtotal >= 199 ? 0 : 10;
  const total = subtotal + shipping;

  const subtotalEl = document.querySelector('.subtotal');
  const shippingEl = document.querySelector('.shipping');
  const finalEl = document.querySelector('.final-total');

  if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? '免运费' : `¥${shipping.toFixed(2)}`;
  if (finalEl) finalEl.textContent = `¥${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', initCart);
