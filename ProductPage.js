   console.log("Welcome to ShopSwift!");

    // Dark mode
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Global variables
    let allProducts = [];
    let currentProducts = [];
    let cartCount = 0;

    // Carousel functions
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
    setInterval(nextSlide, 5000);

    // Search functions
    function toggleMobileSearch() {
      const mobileSearch = document.getElementById('mobileSearch');
      mobileSearch.classList.toggle('hidden');
    }

    async function performSearch() {
      const searchTerm = document.getElementById('searchInput').value.trim();
      if (searchTerm === '') {
        displayAllProducts();
        return;
      }
      searchProducts(searchTerm);
    }

    async function performMobileSearch() {
      const searchTerm = document.getElementById('mobileSearchInput').value.trim();
      if (searchTerm === '') {
        displayAllProducts();
        return;
      }
      searchProducts(searchTerm);
      // Hide mobile search after search
      document.getElementById('mobileSearch').classList.add('hidden');
    }

    function searchProducts(searchTerm) {
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('productsGrid').innerHTML = '';
      document.getElementById('noResults').classList.add('hidden');

      // Filter products by title or description
      const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        
        if (filteredProducts.length === 0) {
          document.getElementById('noResults').classList.remove('hidden');
          document.getElementById('sectionTitle').textContent = `No results for "${searchTerm}"`;
        } else {
          displayProducts(filteredProducts);
          document.getElementById('sectionTitle').textContent = `Search results for "${searchTerm}" (${filteredProducts.length} found)`;
        }
      }, 300);
    }

    function clearSearch() {
      document.getElementById('searchInput').value = '';
      document.getElementById('mobileSearchInput').value = '';
      document.getElementById('noResults').classList.add('hidden');
      displayAllProducts();
    }

    // Add Enter key support for search
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });

      document.getElementById('mobileSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performMobileSearch();
        }
      });
    });

    // API functions
    async function fetchProducts() {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        allProducts = await response.json();
        currentProducts = [...allProducts];
        displayProducts(allProducts);
        document.getElementById('loading').classList.add('hidden');
      } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('loading').innerHTML = '<p class="text-red-500">Failed to load products</p>';
      }
    }

    function displayAllProducts() {
      document.getElementById('loading').classList.remove('hidden');
      setTimeout(() => {
        displayProducts(allProducts);
        document.getElementById('sectionTitle').textContent = 'All Products';
        document.getElementById('loading').classList.add('hidden');
      }, 200);
    }

    function displayProducts(productsToShow) {
      const grid = document.getElementById('productsGrid');
      grid.innerHTML = '';
      currentProducts = productsToShow;
      
      productsToShow.forEach(product => {
        const productCard = `
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800">
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">${product.title}</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">${product.description}</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-indigo-600">$${product.price}</span>
                <div class="flex items-center">
                  <span class="text-yellow-400">★</span>
                  <span class="text-sm text-gray-600 ml-1">${product.rating.rate}</span>
                </div>
              </div>
              <button onclick="addToCart(${product.id})" class="add-to-cart w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        `;
        grid.innerHTML += productCard;
      });
    }

    // Cart functions
    function addToCart(productId) {
      cartCount++;
      updateCartCount();
      
      // Show a brief feedback
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.classList.add('bg-green-600');
      button.classList.remove('bg-indigo-600');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600');
        button.classList.add('bg-indigo-600');
      }, 1000);
    }

    function updateCartCount() {
      document.getElementById("cartCount").textContent = cartCount;
      document.getElementById("cartCountMobile").textContent = cartCount;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      fetchProducts();
    });

  ///<style>
   