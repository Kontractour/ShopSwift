alert ("hello world and welcome to shopSwift");

console.log("hello world and welcome to shopSwift");

 if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark')
    }


     const carousel = document.getElementById('carousel');
  let index = 0;

  function showSlide() {
    carousel.style.transform = `translateX(${-index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % carousel.children.length;
    showSlide();
  }

  function prevSlide() {
    index = (index - 1 + carousel.children.length) % carousel.children.length;
    showSlide();
  }

  // Auto slide every 5 seconds
  setInterval(nextSlide, 2000);


    // Cart Counter
    let cartCount = 0;
    const cartCountEl = document.getElementById("cartCount");
    const addToCartBtns = document.querySelectorAll(".add-to-cart");

    addToCartBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        cartCount++;
        cartCountEl.textContent = cartCount;
      });
    });

    // Sync both cart counters
function updateCartCount() {
  cartCount++;
  document.getElementById("cartCount").textContent = cartCount;
  document.getElementById("cartCountMobile").textContent = cartCount;
}


