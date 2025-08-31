// ================= CART DISPLAY PAGE FUNCTIONALITY =================
// This is for the cartlist.html page that shows cart items

document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
});

// Display cart items
function displayCartItems() {
  const container = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  
  if (!container) return;

  const cart = cartManager.cart;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Your cart is empty</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Looks like you haven't added any items to your cart yet.</p>
        <a href="ProductPage.html" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Start Shopping
        </a>
      </div>
    `;
    if (totalElement) totalElement.textContent = '$0.00';
    
    // Hide checkout button if cart is empty
    const checkoutBtn = document.querySelector('a[href="checkout.html"]');
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    
    return;
  }

  // Show checkout button if cart has items
  const checkoutBtn = document.querySelector('a[href="checkout.html"]');
  if (checkoutBtn) checkoutBtn.style.display = 'inline-block';

  // Display cart items
  container.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
  
  // Update total
  const total = cartManager.getCartTotal();
  if (totalElement) {
    totalElement.textContent = formatPrice(total);
  }
}

// Create cart item HTML
function createCartItemHTML(item) {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4" data-item-id="${item.id}">
      <!-- Product Image -->
      <div class="w-full md:w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain p-2">
      </div>
      
      <!-- Product Details -->
      <div class="flex-grow">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${truncateText(item.title, 60)}</h3>
        <p class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">${formatPrice(item.price)}</p>
        
        <!-- Quantity Controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center border rounded-lg dark:border-gray-600">
              <button onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})" 
                      class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg">
                -
              </button>
              <span class="px-4 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-w-[3rem] text-center">${item.quantity}</span>
              <button onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})" 
                      class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg">
                +
              </button>
            </div>
            
            <!-- Remove Button -->
            <button onclick="removeCartItem(${item.id})" 
                    class="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded">
              <i class="fa fa-trash"></i> Remove
            </button>
          </div>
          
          <!-- Item Total -->
          <div class="text-right">
            <span class="text-sm text-gray-600 dark:text-gray-400">Total: </span>
            <span class="font-semibold text-gray-900 dark:text-white text-lg">${formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update item quantity
function updateItemQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    removeCartItem(productId);
    return;
  }
  
  cartManager.updateQuantity(productId, newQuantity);
  displayCartItems(); // Refresh display
}

// Remove item from cart
function removeCartItem(productId) {
  if (confirm('Are you sure you want to remove this item from your cart?')) {
    cartManager.removeFromCart(productId);
    displayCartItems(); // Refresh display
    
    // If cart becomes empty, hide checkout button
    if (cartManager.cart.length === 0) {
      const checkoutBtn = document.querySelector('a[href="checkout.html"]');
      if (checkoutBtn) checkoutBtn.style.display = 'none';
    }
  }
}

// Clear entire cart
function clearCart() {
  if (confirm('Are you sure you want to clear your entire cart?')) {
    cartManager.clearCart();
    displayCartItems();
  }
}