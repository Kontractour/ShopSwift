// Fetch and display product details
async function displayProductDetails() {
  const container = document.getElementById('productDetails');
  if (!container) {
    console.error('Error: #productDetails element not found');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">No product ID provided.</p>';
    console.warn('No product ID in URL');
    return;
  }

  container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">Loading product...</p>';
  const product = await fetchProduct(productId);

  if (!product) {
    container.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">Product not found. Please try again later.</p>';
    console.warn(`No product found for ID ${productId}`);
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <img src="${product.image}" alt="${product.title}" class="w-full h-96 object-contain rounded">
      <div>
        <h3 class="text-2xl font-bold mb-4">${product.title}</h3>
        <p class="text-indigo-600 font-bold text-xl mb-4">$${product.price.toFixed(2)}</p>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Category: <span class="capitalize">${product.category}</span></p>
        <p class="text-gray-600 dark:text-gray-300 mb-6">${product.description}</p>
        <button onclick="addToCart(${product.id}) && showAddedFeedback(this)" class="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700">Add to Cart</button>
      </div>
    </div>
  `;
  console.log('Product details loaded:', product.title);
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

// Back button navigation
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    console.log('No history available, redirecting to index.html');
    window.location.href = 'index.html';
  }
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
  console.log('product-details.js loaded at', new Date().toLocaleString());
  updateCartCount();
  displayProductDetails();
  setupMobileMenu();
});