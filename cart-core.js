// Shared API base
const API_BASE = 'https://fakestoreapi.com';

// Fetching data from API
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`API Success for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.message, error.stack);
    return [];
  }
}

// Fetching single product
async function fetchProduct(id) {
  const product = await fetchData(`/products/${id}`);
  console.log(`Fetched product ${id}:`, product);
  return product || null;
}

// Initializing cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Adding item to cart
async function addToCart(productId) {
  const product = await fetchProduct(productId);
  if (!product) {
    console.warn(`Failed to add product ${productId} to cart: Product not found`);
    return false;
  }

  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ id: productId, title: product.title, price: product.price, image: product.image, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  return true;
}

// Removing item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
}

// Updating cart count in header
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cartCount');
  const cartCountMobile = document.getElementById('cartCountMobile');
  if (cartCount) cartCount.textContent = count;
  if (cartCountMobile) cartCountMobile.textContent = count;
}

// To get total cart value
function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}

// Getting cart items
function getCartItems() {
  return cart;
}

// Clearing cart (e.g., after checkout)
function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});