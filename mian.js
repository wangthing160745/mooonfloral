// Cart state
let cart = JSON.parse(localStorage.getItem('mooon-cart') || '[]');

function saveCart() {
  localStorage.setItem('mooon-cart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🌸</div>
        <p>ตะกร้าของคุณยังว่างอยู่</p>
        <a href="shop.html" class="btn btn-outline" style="margin-top:1rem;display:inline-flex;">เลือกซื้อดอกไม้</a>
      </div>`;
    return;
  }

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${i})" title="Remove">✕</button>
    </div>`).join('');
}

function renderCartSubtotal() {
  const el = document.getElementById('cart-subtotal');
  if (el) el.textContent = `$${getCartTotal().toFixed(2)}`;
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartItems();
  renderCartSubtotal();
  renderOrderSummary();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartItems();
  renderCartSubtotal();
  renderOrderSummary();
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
  renderCartSubtotal();
  showToast(`${product.emoji} ${product.name} added to cart`);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// Cart sidebar
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  renderCartItems();
  renderCartSubtotal();
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

// Mobile nav
function toggleNav() {
  document.querySelector('.nav-links')?.classList.toggle('mobile-open');
}

// Order summary on checkout page
function renderOrderSummary() {
  const container = document.getElementById('order-items');
  const totalEl = document.getElementById('order-total');
  const subtotalEl = document.getElementById('order-subtotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="summary-empty">ยังไม่มีสินค้าในตะกร้า</p>';
    if (totalEl) totalEl.textContent = '$0.00';
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    </div>`).join('');

  const shipping = cart.length > 0 ? 9.99 : 0;
  const total = getCartTotal() + shipping;
  if (subtotalEl) subtotalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  const shippingEl = document.getElementById('order-shipping');
  if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
}

// Filter products on shop page
function filterProducts(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  document.querySelectorAll('.product-card').forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.style.display = match ? '' : 'none';
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartItems();
  renderCartSubtotal();
  renderOrderSummary();

  // Mark active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Checkout form submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', e => {
      e.preventDefault();
      cart = [];
      saveCart();
      window.location.href = 'success.html';
    });
  }

  // Contact form submit
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      showToast('✉️ Message sent! We\'ll be in touch soon.');
      contactForm.reset();
    });
  }
});
