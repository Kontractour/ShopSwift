




// shop-script.js
// Combined, fixed and improved script for index.html
// - safe DOM checks
// - carousel only when present
// - persistent cart stored in localStorage (with quantities)
// - reliable Add to Cart wiring (no inline onclick hacks)
// - mobile menu dialog handling
// - search + rendering remain as before (but safer)
// - small toast notifications for UX

/* =========================
   Helper / small utilities
   ========================= */

function log(...args) { console.log(...args); }
log("Hello world and welcome to ShopSwift");

// show a small temporary toast (top-center)
function showToast(message, timeout = 2500) {
  const id = 'ss-toast';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.opacity = '1';
  clearTimeout(el._hideTimeout);
  el._hideTimeout = setTimeout(() => {
    el.style.opacity = '0';
  }, timeout);
}

/* =========================
   Dark theme handling
   ========================= */

(function initTheme() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

/* =========================
   Carousel (safely)
   ========================= */

(function initCarousel() {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  let index = 0;
  const slides = carousel.children.length;

  function showSlide() {
    carousel.style.transform = `translateX(${-index * 100}%)`;
  }

  window.nextSlide = function () {
    if (!slides) return;
    index = (index + 1) % slides;
    showSlide();
  };

  window.prevSlide = function () {
    if (!slides) return;
    index = (index - 1 + slides) % slides;
    showSlide();
  };

  // Auto slide only when there's more than one slide
  if (slides > 1) setInterval(window.nextSlide, 5000);
})();

/* =========================
   Cart helpers (localStorage)
   ========================= */

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function cartTotalItems() {
  const cart = getCart();
  return cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
}

function updateCartCountUI() {
  const count = cartTotalItems();
  const el = document.getElementById('cartCount');
  const elMobile = document.getElementById('cartCountMobile');
  if (el) el.textContent = count;
  if (elMobile) elMobile.textContent = count;
}

/**
 * Adds product to cart.
 * - If same id exists, increments quantity
 * - product expected shape: { id, title, price, image } (rest tolerated)
 */
function addToCart(product) {
  if (!product) return;
  const cart = getCart();

  // ensure product has id (fallback to title)
  const pid = product.id ?? product.title;
  const existing = cart.find(i => String(i.id) === String(pid));

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    // normalize fields
    cart.push({
      id: pid,
      title: product.title ?? product.name ?? 'Product',
      price: Number(product.price) || 0,
      image: product.image ?? product.img ?? '',
      quantity: 1,
    });
  }

  saveCart(cart);
  updateCartCountUI();
  showToast(`${product.title ?? 'Item'} added to cart`);
  log('Cart now:', cart);
}

/* =========================
   Mobile search toggle
   ========================= */

function toggleMobileSearch() {
  const mobileSearch = document.getElementById('mobileSearch');
  if (!mobileSearch) return;
  mobileSearch.classList.toggle('hidden');
}
window.toggleMobileSearch = toggleMobileSearch; // keep global for inline usage

/* =========================
   API calls & search
   ========================= */

async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    return await res.json();
  } catch (err) {
    console.error('Error fetching products', err);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('https://fakestoreapi.com/products/categories');
    return await res.json();
  } catch (err) {
    console.error('Error fetching categories', err);
    return [];
  }
}

async function searchProducts(query) {
  if (!query) return [];
  try {
    const products = await fetchProducts();
    const q = query.toLowerCase();
    return products.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  } catch (err) {
    console.error('Search error', err);
    return [];
  }
}

/* =========================
   Rendering logic
   ========================= */

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

  // Using a safe template and then wiring the button event (avoids inline onclick string escaping issues)
  card.innerHTML = `
    <div class="w-full h-48 flex items-center justify-center">
      <img src="${product.image}" alt="${(product.title||'product').replace(/"/g,'')}" class="max-h-44 object-contain p-4">
    </div>
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">${product.title}</h3>
      <p class="text-xs text-gray-600 mb-2 capitalize">${product.category}</p>
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-indigo-600">$${Number(product.price).toFixed(2)}</span>
        <button class="add-to-cart-btn bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
          Add to Cart
        </button>
      </div>
      <div class="flex items-center mt-2">
        <span class="text-yellow-400">★</span>
        <span class="text-sm text-gray-600 ml-1">${product.rating?.rate ?? 'N/A'} (${product.rating?.count ?? 0})</span>
      </div>
    </div>
  `;

  // Attach listener to the button
  const btn = card.querySelector('.add-to-cart-btn');
  if (btn) {
    btn.addEventListener('click', () => addToCart(product));
  }

  return card;
}

function createCategoryCard(category) {
  const card = document.createElement('div');
  card.className = 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer';
  card.innerHTML = `
    <h3 class="text-xl font-bold capitalize mb-2">${category}</h3>
    <p class="text-indigo-100">Explore ${category} products</p>
  `;
  card.addEventListener('click', () => {
    // navigate to product listing filtered by category if desired
    showToast(`Filter by ${category} (not implemented)`);
  });
  return card;
}

function displayFeaturedProducts(products) {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  container.innerHTML = '';
  const featuredItems = products.slice(0, 8);
  featuredItems.forEach(p => container.appendChild(createProductCard(p)));
}

function displayCategories(categories) {
  const container = document.getElementById('categoriesSection');
  if (!container) return;
  container.innerHTML = '';
  categories.forEach(c => container.appendChild(createCategoryCard(c)));
}

function createSearchResultsContainer() {
  const container = document.createElement('div');
  container.id = 'searchResults';
  container.className = 'container mx-auto px-4 py-8';
  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-6';
  title.textContent = 'Search Results';
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
  container.appendChild(title);
  container.appendChild(grid);

  // Insert after hero section (the first section on the page)
  const heroSection = document.querySelector('section');
  if (heroSection && heroSection.parentNode) {
    heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
  } else {
    document.body.appendChild(container);
  }

  return grid;
}

function displaySearchResults(products) {
  const grid = document.getElementById('searchResults') || createSearchResultsContainer();
  grid.innerHTML = '';
  if (!products || products.length === 0) {
    grid.innerHTML = '<p class="text-center text-gray-500 py-8">No products found.</p>';
    return;
  }
  products.forEach(p => grid.appendChild(createProductCard(p)));
  grid.scrollIntoView({ behavior: 'smooth' });
}

/* =========================
   Mobile menu dialog wiring
   ========================= */

function initMobileMenuHandlers() {
  const mobileMenu = document.getElementById('mobile-menu');
  const openMenuBtn = document.querySelector("[command='show-modal'][commandfor='mobile-menu']");
  const closeMenuBtn = document.querySelector("[command='close'][commandfor='mobile-menu']");

  if (mobileMenu && typeof mobileMenu.showModal === 'function') {
    if (openMenuBtn) openMenuBtn.addEventListener('click', () => mobileMenu.showModal());
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => mobileMenu.close());
  } else {
    // If no native dialog support or not present: fallback toggle behavior for a >div menu
    const fallbackMenu = document.getElementById('mobile-menu');
    if (openMenuBtn && fallbackMenu) {
      openMenuBtn.addEventListener('click', () => fallbackMenu.classList.toggle('hidden'));
      if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => fallbackMenu.classList.add('hidden'));
    }
  }
}

/* =========================
   Search key handlers
   ========================= */

function initSearchHandlers() {
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) return;
        searchProducts(q).then(displaySearchResults);
      }
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = mobileSearchInput.value.trim();
        if (!q) return;
        searchProducts(q).then(displaySearchResults);
      }
    });
  }
}

/* =========================
   Navbar scroll shadow (visual polish)
   ========================= */

function initNavbarScrollShadow() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) header.classList.add('shadow-md');
    else header.classList.remove('shadow-md');
  });
}

/* =========================
   Initialize page (DOMContentLoaded)
   ========================= */

document.addEventListener('DOMContentLoaded', async () => {
  // Update cart count right away
  updateCartCountUI();

  // Wire mobile menu
  initMobileMenuHandlers();

  // Wire search enter keys
  initSearchHandlers();

  // Navbar scroll shadow
  initNavbarScrollShadow();

  // Load and render products + categories
  try {
    const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
    displayFeaturedProducts(products);
    displayCategories(categories);
    log('Products & categories loaded');
  } catch (err) {
    console.error('Error initializing products/categories', err);
  }
});

