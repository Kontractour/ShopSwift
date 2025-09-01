// Calculate total locally as a fallback
function calculateCartTotal(cart) {
  console.log('Calculating cart total with items:', cart);
  if (!Array.isArray(cart) || cart.length === 0) {
    console.warn('Cart is empty or invalid for total calculation');
    return 0;
  }
  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity) || 1;
    if (isNaN(price) || isNaN(quantity)) {
      console.error(`Invalid price or quantity for item ${item.id}: price=${item.price}, quantity=${item.quantity}`);
      return sum;
    }
    console.log(`Item ${item.id}: price=$${price.toFixed(2)}, quantity=${quantity}, subtotal=$${(price * quantity).toFixed(2)}`);
    return sum + price * quantity;
  }, 0);
  console.log(`Calculated total: $${total.toFixed(2)}`);
  return total;
}

// Display cart items
function displayCartItems() {
  const container = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  if (!container || !totalElement) {
    console.error('Error: #cart-items or #cart-total element not found');
    return;
  }

  const cartItems = getCartItems();
  console.log('Cart items retrieved:', cartItems);

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    container.innerHTML = `
      <p class="text-center text-gray-600 dark:text-gray-400 py-8">
        Your cart is empty. <a href="ProductPage.html" class="text-blue-500 hover:underline">Continue shopping</a>.
      </p>
    `;
    totalElement.textContent = '$0.00';
    console.log('Cart is empty');
    updateCartCount();
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0 border border-gray-200 dark:border-gray-700">
      <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-contain rounded self-center sm:self-start"
           onload="console.log('Cart item image loaded: ${item.image}')"
           onerror="console.error('Cart item image failed to load: ${item.image}')">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base sm:text-lg truncate">${item.title}</h3>
        <p class="text-indigo-600 dark:text-indigo-400 font-bold text-sm sm:text-base">$${parseFloat(item.price).toFixed(2)}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
                class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
          <i class="fa fa-minus"></i>
        </button>
        <span class="text-base sm:text-lg w-8 text-center">${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
                class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
          <i class="fa fa-plus"></i>
        </button>
      </div>
      <button onclick="removeItem(${item.id})"
              class="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 text-sm font-medium">
        Remove
      </button>
    </div>
  `).join('');

  // Try getCartTotal, fallback to calculateCartTotal
  let total;
  try {
    total = parseFloat(getCartTotal());
    if (isNaN(total)) {
      console.warn('getCartTotal returned NaN:', total);
      total = calculateCartTotal(cartItems);
    } else if (total === 0 && cartItems.length > 0) {
      console.warn('getCartTotal returned 0 despite non-empty cart:', cartItems);
      total = calculateCartTotal(cartItems);
    }
  } catch (error) {
    console.error('Error in getCartTotal:', error.message);
    total = calculateCartTotal(cartItems);
  }
  totalElement.textContent = `$${total.toFixed(2)}`;
  console.log(`Cart items loaded: ${cartItems.length}, Total: $${total.toFixed(2)}`);

  // Verify DOM rendering
  setTimeout(() => {
    const itemsInDom = container.querySelectorAll('.bg-white, .dark\\:bg-gray-900');
    console.log(`Cart items in DOM: ${itemsInDom.length}`);
  }, 1000);

  // Update cart count
  updateCartCount();
}

// Update item quantity
async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(productId);
    displayCartItems();
    return;
  }

  const cart = getCartItems();
  const item = cart.find(i => i.id === productId);
  if (!item) {
    console.error(`Item ${productId} not found in cart`);
    return;
  }

  if (newQuantity > item.quantity) {
    // Increment quantity
    const success = await addToCart(productId);
    if (!success) {
      console.error(`Failed to increment quantity for product ${productId}`);
      return;
    }
  } else {
    // Decrement quantity
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  displayCartItems();
}

// Remove item from cart
function removeItem(productId) {
  removeFromCart(productId);
  displayCartItems();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('cartlist.js loaded at', new Date().toLocaleString());
  updateCartCount();
  displayCartItems();
});