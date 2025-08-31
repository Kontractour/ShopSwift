// ================= CHECKOUT PAGE FUNCTIONALITY =================
// This is CheckOut.js for the checkout.html page

document.addEventListener('DOMContentLoaded', () => {
  // Wait for cart-core.js to initialize
  if (!window.cartManager) {
    console.error('Cart Manager not initialized');
    return;
  }
  
  console.log('Loading checkout page...');
  updateOrderSummary();
  setupFormValidation();
  setupShippingChange();
  
  // Redirect if cart is empty
  if (window.cartManager.cart.length === 0) {
    alert('Your cart is empty. Redirecting to products page.');
    window.location.href = 'ProductPage.html';
  }
});

// Update order summary
function updateOrderSummary() {
  const subtotal = window.cartManager.getCartTotal();
  const shippingSelect = document.getElementById('shipping');
  const shippingCost = shippingSelect ? parseFloat(shippingSelect.value) : 10;
  const total = subtotal + shippingCost;

  // Update display elements
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shippingCost');
  const totalElement = document.getElementById('total');

  if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
  if (shippingElement) shippingElement.textContent = formatPrice(shippingCost);
  if (totalElement) totalElement.textContent = formatPrice(total);
}

// Setup shipping method change handler
function setupShippingChange() {
  const shippingSelect = document.getElementById('shipping');
  if (shippingSelect) {
    shippingSelect.addEventListener('change', updateOrderSummary);
  }
}

// Setup form validation
function setupFormValidation() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  // Real-time validation
  const inputs = form.querySelectorAll('input[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });

  // Card number formatting
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', formatCardNumber);
  }

  // Expiry formatting
  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', formatExpiry);
  }

  // CVV validation
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', formatCVV);
  }

  // Form submission
  form.addEventListener('submit', handleFormSubmit);
}

// Validate individual field
function validateField(input) {
  const value = input.value.trim();
  const fieldId = input.id;
  let isValid = true;
  let errorMessage = '';

  switch (fieldId) {
    case 'firstName':
    case 'lastName':
      isValid = value.length >= 2;
      errorMessage = `${fieldId === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters.`;
      break;
    
    case 'address':
      isValid = value.length >= 5;
      errorMessage = 'Please enter a valid address.';
      break;
    
    case 'city':
      isValid = value.length >= 2;
      errorMessage = 'Please enter a valid city.';
      break;
    
    case 'zip':
      isValid = /^\d{5}(-\d{4})?$/.test(value);
      errorMessage = 'Please enter a valid ZIP code (12345 or 12345-6789).';
      break;
    
    case 'cardNumber':
      const cleanCard = value.replace(/\s/g, '');
      isValid = /^\d{16}$/.test(cleanCard);
      errorMessage = 'Please enter a valid 16-digit card number.';
      break;
    
    case 'expiry':
      isValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
      errorMessage = 'Please enter a valid expiry date (MM/YY).';
      break;
    
    case 'cvv':
      isValid = /^\d{3}$/.test(value);
      errorMessage = 'Please enter a valid 3-digit CVV.';
      break;
  }

  showFieldError(fieldId, isValid ? '' : errorMessage);
  return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
  if (errorElement) {
    if (message) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    } else {
      errorElement.classList.add('hidden');
    }
  }
}

// Clear field error
function clearFieldError(input) {
  const fieldId = input.id;
  const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

// Format card number (add spaces every 4 digits)
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = formattedValue;
}

// Format expiry date (MM/YY)
function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
}

// Format CVV (numbers only, max 3 digits)
function formatCVV(e) {
  e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate all fields
  const form = e.target;
  const inputs = form.querySelectorAll('input[required]');
  let isFormValid = true;

  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });

  if (!isFormValid) {
    alert('Please fix the errors in the form before submitting.');
    return;
  }

  // Process the order
  processOrder();
}

// Process order
function processOrder() {
  // Show loading state
  const submitButton = document.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = 'Processing...';
  }

  // Simulate order processing
  setTimeout(() => {
    // Clear cart
    window.cartManager.clearCart();
    
    // Show success alert
    showSuccessAlert();
    
    // Redirect to home page after 3 seconds
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);
  }, 2000);
}

// Show success alert
function showSuccessAlert() {
  const alert = document.getElementById('successAlert');
  if (alert) {
    alert.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      alert.classList.add('hidden');
    }, 3000);
  }
}