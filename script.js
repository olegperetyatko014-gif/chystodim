/* =========================================================
   ЧистоДім — script.js
   Catalog rendering, filtering/search, and cart logic
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. PRODUCT DATA
     categories: laundry | dishwashing | cleaning | air
  --------------------------------------------------------- */
  const PRODUCTS = [
    // Laundry detergents
    { id: 'l1', category: 'shampoo', name: 'Balea Kids 2in1 Surfosaurus', vol: '300ml', price: 69, oldPrice: 90, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (1).png' },
    { id: 'l2', category: 'shampoo', name: 'Balea Kids 2in1 Fairy Garden', vol: '300ml', price: 69, oldPrice: 90, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (2).png' },
    { id: 'l3', category: 'shampoo', name: 'Balea Family', vol: '500ml', price: 69, oldPrice: 90, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (3).png' },
    { id: 'l4', category: 'shampoo', name: 'Balea Intensiv', vol: '300ml', price: 47, oldPrice: 90, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (4).png' },
    { id: 'l5', category: 'shampoo', name: 'Balea Shampoo Pure Fresh', vol: '300ml', price: 47, oldPrice: 90, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (5).png' },
    { id: 'l6', category: 'toothpaste', name: 'TheraMed  Origina', vol: '100ml', price: 99, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (6).png' },
    { id: 'l7', category: 'toothpaste', name: 'TheraMed Atem-Frish', vol: '100ml', price: 99, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (7).png' },
    { id: 'l8', category: 'toothpaste', name: 'Theramed Complete Plus', vol: '100ml', price: 99, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (8).png' },
    { id: 'l9', category: 'toothpaste', name: 'TheraMed  Natur-WeiB', vol: '100ml', price: 99, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (9).png' },
    { id: 'l10', category: 'toothpaste', name: 'Dontodent Brillant Weiss', vol: '125ml', price: 62, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (10).png' },
    { id: 'l11', category: 'toothpaste', name: 'Dontodent Sensetive', vol: '125ml', price: 62, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (11).png' },
    { id: 'l12', category: 'toothpaste', name: 'Dontodent Sensetive', vol: '500ml', price: 62, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (12).png' },
    { id: 'l13', category: 'dishwashing', name: 'Arancio CHANTECLAIR', vol: '500ml', price: 58, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (13).png' },
    { id: 'l14', category: 'dishwashing', name: 'Melograno CHANTECLAIR', vol: '500ml', price: 58, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (14).png' },
    { id: 'l15', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (15).png' },
    { id: 'l16', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (16).png' },
    { id: 'l17', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (17).png' },
    { id: 'l18', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (18).png' },
    { id: 'l19', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (19).png' },
    { id: 'l20', category: 'dishwashing', name: 'DUAL POWER', vol: '1l', price: 96, oldPrice: 100, badge: 'Хіт', tint: 0, image: 'images/images-Photoroom (20).png' },
  ];

  const CATEGORY_LABELS = {
    laundry: 'Засоби для прання',
    dishwashing: 'Засоби для посуду',
    cleaning: 'Побутова хімія',
    air: 'Освіжувач повітря',
    shampoo: 'Шампуні',
    toothpaste: 'Зубні пасти'
  };

  // tint palettes used to color the generated product icons (no external images)
  const TINTS = [
    { main: '#0E7C66', light: '#CFEDE2' }, // primary
    { main: '#FF6F59', light: '#FFE0D7' }, // accent
    { main: '#3D7FB8', light: '#D7E8F7' }, // blue
    { main: '#B8862F', light: '#F4E5C8' }, // amber
  ];

  /* ---------------------------------------------------------
     2. STATE
  --------------------------------------------------------- */
  let activeFilter = 'all';
  let searchTerm = '';
  let cart = loadCart();
  let favorites = loadFavorites();

  /* ---------------------------------------------------------
     3. DOM REFERENCES
  --------------------------------------------------------- */
  const productGrid   = document.getElementById('productGrid');
  const emptyState    = document.getElementById('emptyState');
  const chips         = document.getElementById('chips');
  const navLinks       = document.getElementById('navLinks');
  const searchInput   = document.getElementById('searchInput');
  const searchBtn     = document.getElementById('searchBtn');
  const burgerBtn     = document.getElementById('burgerBtn');
  const navbarSearch  = document.querySelector('.navbar__search');

  const cartToggle    = document.getElementById('cartToggle');
  const cartClose     = document.getElementById('cartClose');
  const cartDrawer    = document.getElementById('cartDrawer');
  const overlay       = document.getElementById('overlay');
  const cartBody      = document.getElementById('cartBody');
  const cartBadge     = document.getElementById('cartBadge');
  const cartTotalEl   = document.getElementById('cartTotal');
  const clearCartBtn  = document.getElementById('clearCartBtn');
  const checkoutBtn   = document.getElementById('checkoutBtn');
  const toast         = document.getElementById('toast');

  const favToggle     = document.getElementById('favToggle');
  const favClose      = document.getElementById('favClose');
  const favDrawer     = document.getElementById('favDrawer');
  const favBody       = document.getElementById('favBody');
  const favBadge      = document.getElementById('favBadge');
  const themeToggle    = document.getElementById('themeToggle');

  /* ---------------------------------------------------------
     4. ICON GENERATOR (inline SVG — no external images)
  --------------------------------------------------------- */
  function productIcon(category, tintIndex) {
    const t = TINTS[tintIndex % TINTS.length];
    const shapes = {
      laundry: `
        <circle cx="50" cy="50" r="42" fill="${t.light}"/>
        <rect x="22" y="20" width="56" height="62" rx="8" fill="${t.main}"/>
        <rect x="30" y="14" width="40" height="10" rx="4" fill="${t.main}"/>
        <circle cx="50" cy="54" r="18" fill="${t.light}"/>
        <circle cx="50" cy="54" r="10" fill="#fff" opacity=".7"/>`,
      dishwashing: `
        <circle cx="50" cy="50" r="42" fill="${t.light}"/>
        <ellipse cx="50" cy="64" rx="30" ry="10" fill="${t.main}" opacity=".25"/>
        <path d="M30 30c0-8 9-14 20-14s20 6 20 14-9 30-20 30-20-22-20-30z" fill="${t.main}"/>
        <ellipse cx="50" cy="30" rx="9" ry="5" fill="#fff" opacity=".6"/>`,
      cleaning: `
        <circle cx="50" cy="50" r="42" fill="${t.light}"/>
        <rect x="40" y="16" width="20" height="34" rx="6" fill="${t.main}"/>
        <path d="M30 50h40l-5 30a6 6 0 0 1-6 5H41a6 6 0 0 1-6-5z" fill="${t.main}" opacity=".85"/>
        <rect x="36" y="44" width="28" height="10" rx="3" fill="#fff" opacity=".5"/>`,
      air: `
        <circle cx="50" cy="50" r="42" fill="${t.light}"/>
        <path d="M50 20c8 12 18 22 18 33a18 18 0 1 1-36 0c0-11 10-21 18-33z" fill="${t.main}"/>
        <circle cx="50" cy="56" r="7" fill="#fff" opacity=".6"/>`
    };
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${shapes[category] || shapes.cleaning}</svg>`;
  }

  /* ---------------------------------------------------------
     5. RENDER CATALOG
  --------------------------------------------------------- */
  function renderCatalog() {
    const term = searchTerm.trim().toLowerCase();

    const filtered = PRODUCTS.filter(p => {
      const matchesCategory = activeFilter === 'all' || p.category === activeFilter;
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || CATEGORY_LABELS[p.category].toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = filtered.map(p => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-card__media">
          ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ''}
          <button class="fav-btn${favorites[p.id] ? ' is-active' : ''}" data-id="${p.id}" aria-label="${favorites[p.id] ? 'Видалити з обраного' : 'Додати в обране'}">
            <svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${favorites[p.id] ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
          </button>
          <div class="product-card__shine"></div>
          ${p.image
  ? `<img src="${p.image}" alt="${p.name}" class="product-image">`
  : productIcon(p.category, p.tint)}
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${CATEGORY_LABELS[p.category]}</span>
          <h3 class="product-card__title">${p.name}</h3>
          <span class="product-card__vol">Об'єм/вага: ${p.vol}</span>
          <div class="product-card__footer">
            <span class="product-card__price">${p.oldPrice ? `<small>${p.oldPrice} ₴</small>` : ''}${p.price} ₴</span>
            <button class="add-btn" data-id="${p.id}">+ У кошик</button>
          </div>
        </div>
      </article>
    `).join('');

    emptyState.hidden = filtered.length !== 0;
  }

  /* ---------------------------------------------------------
     6. FILTERING — chips & nav links
  --------------------------------------------------------- */
  function setActiveFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === filter));
    renderCatalog();
  }

  chips.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    setActiveFilter(chip.dataset.filter);
    const catalog = document.getElementById('catalog');

window.scrollTo({
    top: catalog.offsetTop - 170,
    behavior: 'smooth'
});
});

  document.querySelectorAll('[data-filter]').forEach(link => {
    if (link.classList.contains('chip')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      setActiveFilter(link.dataset.filter);
      const catalog = document.getElementById('catalog');

window.scrollTo({
    top: catalog.offsetTop - 170,
    behavior: 'smooth'
});
      navLinks.classList.remove('is-open');
      burgerBtn.classList.remove('is-active');
    });
  });

  /* ---------------------------------------------------------
     7. SEARCH
  --------------------------------------------------------- */
  function runSearch() {
    searchTerm = searchInput.value;
    renderCatalog();
    const catalog = document.getElementById('catalog');

window.scrollTo({
    top: catalog.offsetTop - 170,
    behavior: 'smooth'
});
  }
  searchBtn.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  searchInput.addEventListener('input', () => { searchTerm = searchInput.value; renderCatalog(); });

  /* ---------------------------------------------------------
     8. MOBILE MENU
  --------------------------------------------------------- */
  burgerBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navbarSearch.classList.toggle('is-open', open);
    burgerBtn.classList.toggle('is-active', open);
    burgerBtn.setAttribute('aria-expanded', String(open));
  });

  /* ---------------------------------------------------------
     9. CART — persistence helpers
  --------------------------------------------------------- */
  function loadCart() {
    try {
      const raw = localStorage.getItem('chystodim_cart');
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }
  function saveCart() {
    try { localStorage.setItem('chystodim_cart', JSON.stringify(cart)); }
    catch (err) { /* storage unavailable — cart stays in-memory only */ }
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    flashAddButton(id);
    showToast('Товар додано до кошика');
  }
  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart();
    renderCart();
  }
  function removeFromCart(id) {
    delete cart[id];
    saveCart();
    renderCart();
    showToast('Товар видалено з кошика');
  }
  function clearCart() {
    cart = {};
    saveCart();
    renderCart();
    showToast('Кошик очищено');
  }

  function flashAddButton(id) {
    const btn = document.querySelector(`.add-btn[data-id="${id}"]`);
    if (!btn) return;
    const original = btn.textContent;
    btn.classList.add('is-added');
    btn.textContent = '✓ Додано';
    setTimeout(() => { btn.classList.remove('is-added'); btn.textContent = original; }, 1200);
  }

  /* ---------------------------------------------------------
     9b. FAVORITES — persistence + logic
  --------------------------------------------------------- */
  function loadFavorites() {
    try {
      const raw = localStorage.getItem('chystodim_favorites');
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }
  function saveFavorites() {
    try { localStorage.setItem('chystodim_favorites', JSON.stringify(favorites)); }
    catch (err) { /* storage unavailable — favorites stay in-memory only */ }
  }

  function isFavorite(id) { return !!favorites[id]; }

  function toggleFavorite(id) {
    if (favorites[id]) {
      delete favorites[id];
      showToast('Видалено з обраного');
    } else {
      favorites[id] = true;
      showToast('Додано в обране ♥');
    }
    saveFavorites();
    renderFavButtons();
    renderFavorites();
  }

  function removeFavorite(id) {
    if (!favorites[id]) return;
    delete favorites[id];
    saveFavorites();
    renderFavButtons();
    renderFavorites();
    showToast('Видалено з обраного');
  }

  // sync the heart icon state on any currently-rendered product cards
  function renderFavButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const id = btn.dataset.id;
      const active = isFavorite(id);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-label', active ? 'Видалити з обраного' : 'Додати в обране');
      const path = btn.querySelector('path');
      if (path) path.setAttribute('fill', active ? 'currentColor' : 'none');
    });
  }

  function renderFavorites() {
    const ids = Object.keys(favorites);
    favBadge.textContent = ids.length;

    if (ids.length === 0) {
      favBody.innerHTML = `<p class="fav-empty">У вас ще немає обраних товарів.<br>Натисніть ♥ на товарі, щоб додати 💛</p>`;
      return;
    }

    favBody.innerHTML = ids.map(id => {
      const p = PRODUCTS.find(prod => prod.id === id);
      if (!p) return '';
      return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item__media">
  ${
    p.image
      ? `<img src="${p.image}" alt="${p.name}" class="cart-image">`
      : productIcon(p.category, p.tint)
  }
</div>
          <div>
            <div class="cart-item__title">${p.name}</div>
            <div class="cart-item__price">${p.price} ₴</div>
          </div>
          <div class="fav-item__controls">
            <button class="fav-add-btn" data-id="${id}">+ У кошик</button>
            <button class="fav-remove-btn" data-id="${id}">Видалити</button>
          </div>
        </div>
      `;
    }).join('');
  }

  favBody.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('fav-add-btn')) addToCart(id);
    else if (e.target.classList.contains('fav-remove-btn')) removeFavorite(id);
  });

  productGrid.addEventListener('click', e => {
    const favBtn = e.target.closest('.fav-btn');
    if (!favBtn) return;
    toggleFavorite(favBtn.dataset.id);
  });

  function openFav() {
    favDrawer.classList.add('is-open');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
  function closeFav() {
    favDrawer.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  favToggle.addEventListener('click', openFav);
  favClose.addEventListener('click', closeFav);
  overlay.addEventListener('click', () => { closeFav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFav(); });

  const navFavLink = document.getElementById('navFavLink');
  if (navFavLink) {
    navFavLink.addEventListener('click', () => {
      openFav();
      navLinks.classList.remove('is-open');
      burgerBtn.classList.remove('is-active');
    });
  }

  /* ---------------------------------------------------------
     10. RENDER CART
  --------------------------------------------------------- */
  function renderCart() {
    const entries = Object.entries(cart);
    const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0);
    cartBadge.textContent = totalItems;

    if (entries.length === 0) {
      cartBody.innerHTML = `<p class="cart-empty">Ваш кошик порожній.<br>Додайте товари з каталогу 🧺</p>`;
      cartTotalEl.textContent = '0 ₴';
      return;
    }

    let total = 0;
    cartBody.innerHTML = entries.map(([id, qty]) => {
      const p = PRODUCTS.find(prod => prod.id === id);
      if (!p) return '';
      const lineTotal = p.price * qty;
      total += lineTotal;
      return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item__media">
  ${
    p.image
      ? `<img src="${p.image}" alt="${p.name}" class="cart-image">`
      : productIcon(p.category, p.tint)
  }
</div>
          <div>
            <div class="cart-item__title">${p.name}</div>
            <div class="cart-item__price">${p.price} ₴ × ${qty} = ${lineTotal} ₴</div>
          </div>
          <div class="cart-item__controls">
            <div class="qty-control">
              <button class="qty-minus" data-id="${id}" aria-label="Зменшити кількість">−</button>
              <span>${qty}</span>
              <button class="qty-plus" data-id="${id}" aria-label="Збільшити кількість">+</button>
            </div>
            <button class="remove-btn" data-id="${id}">Видалити</button>
          </div>
        </div>
      `;
    }).join('');

    cartTotalEl.textContent = `${total} ₴`;
  }

  cartBody.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('qty-plus')) changeQty(id, 1);
    else if (e.target.classList.contains('qty-minus')) changeQty(id, -1);
    else if (e.target.classList.contains('remove-btn')) removeFromCart(id);
  });

  productGrid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    addToCart(btn.dataset.id);
  });

  clearCartBtn.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) return;
    clearCart();
  });

const checkoutModal = document.getElementById('checkoutModal');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
closeCheckoutBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
});
checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
});

checkoutBtn.addEventListener('click', () => {

    if (Object.keys(cart).length === 0) {
        showToast('Кошик порожній');
        return;
    }

    checkoutModal.style.display = 'flex';

});

confirmOrderBtn.addEventListener('click', () => {

    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const address = document.getElementById('customerAddress').value;
    const city = document.getElementById('customerCity').value;

    if (!name || !phone || !email || !address || !city) {
        showToast("Заповніть усі поля");
        return;
    }

    showToast("Замовлення оформлено 🎉");

    clearCart();
    closeCart();

    checkoutModal.style.display = "none";

});

  /* ---------------------------------------------------------
     11. CART DRAWER OPEN / CLOSE
  --------------------------------------------------------- */
  function openCart() {
    cartDrawer.classList.add('is-open');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  /* ---------------------------------------------------------
     12. TOAST NOTIFICATIONS
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-active'), 2200);
  }

  /* ---------------------------------------------------------
     14. DARK THEME TOGGLE
  --------------------------------------------------------- */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('chystodim_theme', theme); }
    catch (err) { /* storage unavailable — theme stays in-memory only */ }
  }
  themeToggle.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(next === 'dark' ? 'Темна тема увімкнена' : 'Світла тема увімкнена');
  });

  /* ---------------------------------------------------------
     13. INIT
  --------------------------------------------------------- */
  renderCatalog();
  renderCart();
  renderFavorites();
})();
