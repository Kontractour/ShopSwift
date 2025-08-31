// Fetch and display products with retry logic
async function fetchProductsWithRetry(endpoint, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const products = await fetchData(endpoint);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
      console.warn(`Attempt ${i + 1}: No products returned for ${endpoint}`);
    } catch (error) {
      console.error(`Attempt ${i + 1}: Error fetching ${endpoint}:`, error.message);
    }
    if (i < retries - 1) {
      console.log(`Retrying ${endpoint} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.error(`Failed to fetch products from ${endpoint} after ${retries} attempts`);
  return [];
}

// Fetch and display categories with static images
async function displayCategories() {
  const container = document.getElementById('categoriesSection');
  if (!container) {
    console.log('No #categoriesSection found on this page; skipping category display');
    return;
  }

  container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">Loading categories...</p>';
  const categories = await fetchData('/products/categories');

  if (!Array.isArray(categories) || categories.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">No categories available. Please try again later.</p>';
    console.warn('Categories API returned:', categories);
    return;
  }

  // Static images for categories with multiple fallbacks
  const categoryImages = {
    electronics: 'assets/electronics.jpg',
    jewelery: 'assets/jewelery.jpg',
    "men's clothing": 'assets/mens-clothing.jpg',
    "women's clothing": 'assets/womens-clothing.jpg'
  };

  const fallbackImage = 'assets/fallback.jpg';
  const secondaryFallback = 'https://via.placeholder.com/150?text=';

  const categoryData = categories.map(category => ({
    category,
    image: categoryImages[category] || `${secondaryFallback}${encodeURIComponent(category)}`
  }));

  container.innerHTML = categoryData.map(({ category, image }) => `
    <a href="ProductPage.html?category=${encodeURIComponent(category)}" class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
      <img src="${image}" alt="${category}" class="w-full h-32 object-contain mb-4 rounded" onload="console.log('Image loaded for ${category}: ${image}')" onerror="this.src='${fallbackImage}'; this.onerror = () => { this.src='${secondaryFallback}${encodeURIComponent(category)}'; console.error('Image failed to load for ${category}: ${image}, using secondary fallback'); }; console.error('Image failed to load for ${category}: ${image}, trying fallback')">
      <h3 class="font-bold text-xl capitalize">${category}</h3>
    </a>
  `).join('');
  console.log('Categories loaded with images:', categoryData);

  // Verify DOM rendering and image visibility
  setTimeout(() => {
    const images = container.querySelectorAll('img');
    console.log(`Category images in DOM: ${images.length}`);
    images.forEach(img => {
      console.log(`Image in DOM: ${img.src}, Visible: ${img.offsetWidth > 0 && img.offsetHeight > 0}`);
      if (img.complete && img.naturalWidth === 0) {
        console.error(`Image broken for ${img.alt}: ${img.src}`);
      }
    });
  }, 1000);
}

async function displayProducts() {
  const container = document.getElementById('productList');
  if (!container) {
    console.error('Error: #productList element not found in DOM');
    return;
  }

  // Show loading spinner
  container.innerHTML = `
    <div class="text-center py-8">
      <i class="fa fa-spinner fa-spin text-3xl text-indigo-600"></i>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Loading products...</p>
    </div>
  `;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const search = urlParams.get('search');

  let endpoint = '/products';
  if (category) {
    endpoint = `/products/category/${encodeURIComponent(category)}`;
  } else if (search) {
    endpoint = '/products';
  }
  console.log(`Fetching products from endpoint: ${endpoint}`);

  const products = await fetchProductsWithRetry(endpoint);
  if (!Array.isArray(products)) {
    container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">Error loading products. Please try again later.</p>';
    console.error('Products data is not an array:', products);
    return;
  }

  let filteredProducts = products;
  if (search) {
    const query = search.toLowerCase();
    filteredProducts = products.filter(product =>
      product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
    );
    console.log(`Filtered products for search "${search}": ${filteredProducts.length}`);
  }

  if (filteredProducts.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">No products found.</p>';
    console.warn(`No products returned for endpoint: ${endpoint}`);
    return;
  }

  container.innerHTML = filteredProducts.map(product => `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain p-4" onload="console.log('Product image loaded: ${product.image}')" onerror="console.error('Product image failed to load: ${product.image}')">
      <div class="p-4">
        <h3 class="font-semibold text-lg truncate">${product.title}</h3>
        <p class="text-indigo-600 font-bold mt-2">$${product.price.toFixed(2)}</p>
        <div class="mt-4 flex justify-between">
          <a href="product-details.html?id=${product.id}" class="text-blue-500 hover:underline">View Details</a>
          <button onclick="addToCart(${product.id}) && showAddedFeedback(this)" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
  console.log(`Products loaded: ${filteredProducts.length} for ${category || search || 'all products'}`);

  // Verify DOM rendering
  setTimeout(() => {
    const productsInDom = container.querySelectorAll('.bg-white, .dark\\:bg-gray-900');
    console.log(`Products in DOM: ${productsInDom.length}`);
  }, 1000);
}

// Show "Added" feedback
function showAddedFeedback(button) {
  const originalText = button.textContent;
  button.textContent = 'Added';
  button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
  button.classList.add('bg-green-500', 'hover:bg-green-600');
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('bg-green-500', 'hover:bg-green-600');
    button.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    button.disabled = false;
  }, 2000);
}

// Search functionality
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    window.location.href = `ProductPage.html?search=${encodeURIComponent(query)}`;
  }
}

function performMobileSearch() {
  const query = document.getElementById('mobileSearchInput').value.trim();
  if (query) {
    window.location.href = `ProductPage.html?search=${encodeURIComponent(query)}`;
  }
}

// Toggle mobile search
function toggleMobileSearch() {
  const mobileSearch = document.getElementById('mobileSearch');
  if (mobileSearch) {
    mobileSearch.classList.toggle('hidden');
  }
}

// Mobile menu handling
function setupMobileMenu() {
  const openButton = document.querySelector('[command="show-modal"][commandfor="mobile-menu"]');
  const closeButton = document.querySelector('[command="close"][commandfor="mobile-menu"]');
  const dialog = document.getElementById('mobile-menu');

  if (openButton) {
    openButton.addEventListener('click', () => dialog.showModal());
  }
  if (closeButton) {
    closeButton.addEventListener('click', () => dialog.close());
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('ProductPage.js loaded at', new Date().toLocaleString());
  updateCartCount();
  displayCategories();
  displayProducts();
  setupMobileMenu();
});