// API Functions
async function fetchProducts(limit = 8) {
  try {
    const response = await fetch(`https://fakestoreapi.com/products?limit=${limit}`);
    const products = await response.json();
    console.log(`Fetched ${products.length} products:`, products);
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

// Show "Added" feedback
function showAddedFeedback(button) {
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
}

// Fetch and display featured products
async function displayFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) {
    console.error('Error: #featuredProducts element not found');
    return;
  }

  container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">Loading products...</div>';
  const products = await fetchProducts(8);

  if (products.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">No products available. Please try again later.</div>';
    console.warn('No products returned from API');
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain p-4">
        <div class="p-4">
          <h3 class="font-semibold text-lg line-clamp-2">${product.title}</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-2 capitalize">${product.category}</p>
          <p class="text-indigo-600 font-bold mt-2">$${product.price.toFixed(2)}</p>
          <div class="mt-4 flex gap-2">
            <a href="product-details.html?id=${product.id}" class="flex-1 text-blue-500 hover:underline text-sm text-center py-2">View Details</a>
            <button onclick="addToCart(${product.id}); showAddedFeedback(this)" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-sm">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  console.log('Featured products rendered:', products.length);
}

// Fetch and display categories with Unsplash images
async function displayCategories() {
  const container = document.getElementById('categoriesSection');
  if (!container) {
    console.error('Error: #categoriesSection element not found');
    return;
  }

  container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">Loading categories...</div>';
  const categories = await fetchCategories();
  const products = await fetchProducts(20); // Fetch all products for accurate counts

  if (!categories.length) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-600 dark:text-gray-400">No categories available. Please try again later.</div>';
    console.warn('No categories returned from API');
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
      <a href="ProductPage.html?category=${encodeURIComponent(category)}" class="group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <img src="${image}" alt="${displayCategory}" class="w-full h-32 object-cover mb-4 rounded" onload="console.log('Image loaded for ${displayCategory}: ${image}')" onerror="this.src='${fallbackImage}'; console.error('Image failed to load for ${displayCategory}: ${image}')">
          <h3 class="font-bold text-xl capitalize text-center">${displayCategory}</h3>
          <p class="text-center text-gray-600 dark:text-gray-300 text-sm">${productCount} products</p>
        </div>
      </a>
    `;
  }).join('');
  console.log('Categories rendered:', categories);

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
  console.log('index.js loaded at', new Date().toLocaleString());
  
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

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

  // Initialize page
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  } else {
    console.warn('updateCartCount not found in cart-core.js');
  }
  displayCategories();
  displayFeaturedProducts();
  setupMobileMenu();
});