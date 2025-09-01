// API Functions
async function fetchProducts() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();
    console.log('Fetched products:', products);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await response.json();
    console.log('Fetched categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function fetchProduct(id) {
  try {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    const product = await response.json();
    console.log(`Fetched product ${id}:`, product);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Display categories with images
async function displayCategories() {
  const container = document.getElementById('categoriesSection');
  if (!container) {
    console.error('Error: #categoriesSection element not found');
    return;
  }

  container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">Loading categories...</div>';
  
  const categories = await fetchCategories();
  const products = await fetchProducts();

  if (!categories.length) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">No categories available.</div>';
    return;
  }

  // Unsplash images for categories
  const categoryImages = {
    "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    "jewelery": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
    "men's clothing": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    "women's clothing": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop"
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';

  container.innerHTML = categories.map(category => {
    const normalizedCategory = category.trim().toLowerCase();
    const categoryProducts = products.filter(p => p.category.trim().toLowerCase() === normalizedCategory);
    const productCount = categoryProducts.length;
    console.log(`Category: ${category}, Product count: ${productCount}, Products:`, categoryProducts);
    const image = categoryImages[normalizedCategory] || fallbackImage;
    const escapedCategory = category.replace(/'/g, "\\'");
    const displayCategory = category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '); // Capitalize for display (e.g., "Women's Clothing")

    return `
      <div class="group cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
           onclick="filterByCategory('${escapedCategory}')">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="aspect-w-16 aspect-h-12 relative">
            <img src="${image}" alt="${displayCategory}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
            <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
            <div class="absolute bottom-4 left-4 text-white">
              <h3 class="text-lg font-bold capitalize">${displayCategory}</h3>
              <p class="text-sm opacity-90">${productCount} products</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Display products
async function displayProducts() {
  const resultsSection = document.getElementById('resultsSection');
  const productsSection = document.getElementById('productsSection');
  const productList = document.getElementById('productList');
  const productListDefault = document.getElementById('productListDefault');
  const heroTitle = document.getElementById('heroTitle');
  const heroText = document.getElementById('heroText');
  const categoriesSectionContainer = document.getElementById('categoriesSectionContainer');
  const categoriesText = document.getElementById('categoriesText');
  const toggleCategories = document.getElementById('toggleCategories');

  if (!productList || !productListDefault || !resultsSection || !productsSection || !heroTitle || !heroText || !categoriesSectionContainer || !categoriesText || !toggleCategories) {
    console.error('Required DOM elements missing');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryFilter = urlParams.get('category');
  
  // Adjust page flow for filtered view
  if (searchQuery || categoryFilter) {
    resultsSection.classList.remove('hidden');
    productsSection.classList.add('hidden');
    heroTitle.textContent = searchQuery ? 'Search Results' : `Products in ${categoryFilter}`;
    heroText.textContent = searchQuery ? 'Showing products matching your search query.' : `Explore our collection in the ${categoryFilter} category.`;
    categoriesText.classList.add('hidden');
    toggleCategories.classList.remove('hidden');
    categoriesSectionContainer.classList.add('mt-4');
  } else {
    resultsSection.classList.add('hidden');
    productsSection.classList.remove('hidden');
    heroTitle.textContent = 'Discover Amazing Products';
    heroText.textContent = 'Explore our curated collection of high-quality products across multiple categories. From the latest electronics to stylish fashion, we have everything you need at unbeatable prices.';
    categoriesText.classList.remove('hidden');
    toggleCategories.classList.add('hidden');
    categoriesSectionContainer.classList.remove('mt-4');
  }

  const container = (searchQuery || categoryFilter) ? productList : productListDefault;
  container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">Loading products...</div>';
  
  let products = await fetchProducts();

  if (!products.length) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">No products available.</div>';
    return;
  }

  // Normalize category names to handle spaces and apostrophes
  const normalizeCategory = (cat) => cat.toLowerCase().replace(/['\s]+/g, ' ').trim();
  
  // Apply filters
  if (searchQuery) {
    products = products.filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (categoryFilter) {
    const normalizedFilter = normalizeCategory(decodeURIComponent(categoryFilter));
    products = products.filter(product => normalizeCategory(product.category) === normalizedFilter);
    console.log(`Filtering by category: ${normalizedFilter}, found ${products.length} products`);
  }

  if (!products.length) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">No products found matching your criteria.</div>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2 line-clamp-2">${product.title}</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-2 capitalize">${product.category}</p>
          <div class="flex items-center justify-between">
            <span class="text-indigo-600 font-bold text-lg">$${product.price.toFixed(2)}</span>
            <div class="flex items-center text-yellow-500 text-sm">
              <i class="fa fa-star"></i>
              <span class="ml-1">${product.rating?.rate || 'N/A'} (${product.rating?.count || 0})</span>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button onclick="addToCartWithFeedback(${product.id}, this)" 
              class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-200 text-sm">
              Add to Cart
            </button>
            <a href="product-details.html?id=${product.id}" class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm text-center">
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Add "View All Products" button for category filter
  if (categoryFilter) {
    const viewAllButton = document.createElement('div');
    viewAllButton.className = 'text-center mt-8';
    viewAllButton.innerHTML = `
      <button onclick="viewAllProducts()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
        View All Products
      </button>
    `;
    resultsSection.appendChild(viewAllButton);
  }
}

// View all products
function viewAllProducts() {
  window.location.href = 'ProductPage.html';
}

// Filter products by category
function filterByCategory(category) {
  const normalizedCategory = encodeURIComponent(category);
  console.log(`Filtering by category: ${category} (encoded: ${normalizedCategory})`);
  window.location.href = `ProductPage.html?category=${normalizedCategory}`;
}

// Add to cart with visual feedback
function addToCartWithFeedback(productId, button) {
  if (typeof addToCart !== 'function') {
    console.error('addToCart function not found');
    return;
  }
  
  addToCart(productId);
  
  // Show "Added" feedback
  const originalText = button.textContent;
  const originalClasses = button.className;
  
  button.textContent = 'Added ✓';
  button.className = 'flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200 text-sm';
  button.disabled = true;
  
  setTimeout(() => {
    button.textContent = originalText;
    button.className = originalClasses;
    button.disabled = false;
  }, 2000);
  
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }
}

// Search functionality
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    console.log(`Searching for: ${query}`);
    window.location.href = `ProductPage.html?search=${encodeURIComponent(query)}`;
  }
}

function performMobileSearch() {
  const query = document.getElementById('mobileSearchInput').value.trim();
  if (query) {
    console.log(`Mobile searching for: ${query}`);
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

// Toggle categories section
function toggleCategoriesSection() {
  const categoriesSection = document.getElementById('categoriesSection');
  if (categoriesSection) {
    categoriesSection.classList.toggle('hidden');
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

// Enter key search functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const toggleCategoriesButton = document.getElementById('toggleCategories');

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performMobileSearch();
    });
  }

  if (toggleCategoriesButton) {
    toggleCategoriesButton.addEventListener('click', toggleCategoriesSection);
  }

  // Initialize page
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  } else {
    console.warn('updateCartCount not found in cart-core.js');
  }
  displayCategories();
  displayProducts();
  setupMobileMenu();
});