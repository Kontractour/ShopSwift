
  tailwind.config = {
    darkMode: 'media',
  };

  const form = document.getElementById("checkoutForm");
  const shippingSelect = document.getElementById("shipping");
  const shippingCost = document.getElementById("shippingCost");
  const total = document.getElementById("total");
  const successAlert = document.getElementById("successAlert");

  let subtotal = 120;

  // Update total dynamically
  shippingSelect.addEventListener("change", () => {
    let ship = parseFloat(shippingSelect.value);
    shippingCost.textContent = `$${ship.toFixed(2)}`;
    total.textContent = `$${(subtotal + ship).toFixed(2)}`;
  });

  // Validation helper
  function validateField(id, errorId) {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input.checkValidity()) {
      error.classList.remove("hidden");
      return false;
    } else {
      error.classList.add("hidden");
      return true;
    }
  }

  // Restrict ZIP to 1–5 digits
  const zip = document.getElementById("zip");
  zip.addEventListener("input", () => {
    zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
  });

  // Card number (digits only, any length)
  const cardNumber = document.getElementById("cardNumber");
  cardNumber.addEventListener("input", () => {
    cardNumber.value = cardNumber.value.replace(/\D/g, "");
  });

  // Expiry MM/YY with auto slash
  const expiry = document.getElementById("expiry");
  expiry.addEventListener("input", () => {
    let value = expiry.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 3) {
      expiry.value = value.slice(0, 2) + "/" + value.slice(2);
    } else {
      expiry.value = value;
    }
  });

  // CVV: 3 digits max
  const cvv = document.getElementById("cvv");
  cvv.addEventListener("input", () => {
    cvv.value = cvv.value.replace(/\D/g, "").slice(0, 3);
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    isValid = validateField("firstName", "errorFirstName") && isValid;
    isValid = validateField("lastName", "errorLastName") && isValid;
    isValid = validateField("address", "errorAddress") && isValid;
    isValid = validateField("city", "errorCity") && isValid;
    isValid = validateField("zip", "errorZip") && isValid;
    isValid = validateField("cardNumber", "errorCardNumber") && isValid;
    isValid = validateField("expiry", "errorExpiry") && isValid;
    isValid = validateField("cvv", "errorCvv") && isValid;

    if (!isValid) return;

    // ✅ Show success alert
    successAlert.classList.remove("hidden");
    setTimeout(() => {
      successAlert.classList.add("hidden");
      form.reset(); // clear form after success
    }, 3000);
  });

  // Responsive order summary cut on large screens
  const orderSummary = document.getElementById("orderSummary");
  function handleResize() {
    if (window.innerWidth >= 1024) {
      orderSummary.classList.add("max-h-64", "overflow-y-auto");
    } else {
      orderSummary.classList.remove("max-h-64", "overflow-y-auto");
    }
  }
  window.addEventListener("resize", handleResize);
  handleResize(); // run on load
