    // --- Utility: Get Cart from localStorage
    function getCart() {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

    // --- Utility: Save Cart to localStorage
    function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    // --- Render Cart Items
    function renderCart() {
      const cart = getCart();
      const cartContainer = document.getElementById("cart-items");
      const totalElement = document.getElementById("cart-total");
      cartContainer.innerHTML = "";

      let total = 0;

      if (cart.length === 0) {
        cartContainer.innerHTML = `
          <p class="text-gray-500 text-center">Your cart is empty 🛒</p>
        `;
        totalElement.textContent = "$0.00";
        return;
      }

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement("div");
        itemElement.className = "flex items-center justify-between border-b pb-4";

        itemElement.innerHTML = `
          <div class="flex items-center space-x-4">
            <img src="${item.image}" alt="${item.name}" class="h-16 w-16 rounded object-cover">
            <div>
              <h2 class="font-semibold">${item.name}</h2>
              <p class="text-sm text-gray-500">$${item.price.toFixed(2)}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <input type="number" min="1" value="${item.quantity}" 
                   class="w-16 text-center border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                   data-index="${index}" />
            <button class="text-red-500 hover:text-red-700 font-medium" data-remove="${index}">Remove</button>
          </div>
        `;

        cartContainer.appendChild(itemElement);
      });

      totalElement.textContent = `$${total.toFixed(2)}`;

      // Handle Quantity Updates
      document.querySelectorAll("input[type='number']").forEach(input => {
        input.addEventListener("change", (e) => {
          const index = e.target.dataset.index;
          let cart = getCart();
          cart[index].quantity = parseInt(e.target.value) || 1;
          saveCart(cart);
          renderCart();
        });
      });

      // Handle Remove
      document.querySelectorAll("button[data-remove]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const index = e.target.dataset.remove;
          let cart = getCart();
          cart.splice(index, 1);
          saveCart(cart);
          renderCart();
        });
      });
    }

    // --- Initialize Cart on Page Load
    document.addEventListener("DOMContentLoaded", renderCart);