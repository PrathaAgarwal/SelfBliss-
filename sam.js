// Check user login status
function checkUserLoginStatus() {
    // Assuming login status is stored in localStorage or obtained from the backend
    return !!localStorage.getItem("userToken");
  }
  
  // Add to wishlist
  async function addToWishlist(productId) {
    if (!checkUserLoginStatus()) {
      alert("Please log in to add products to your wishlist.");
      window.location.href = "/login"; // Redirect to login page
      return;
    }
    try {
      const response = await fetch("/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
  
      if (response.ok) {
        alert("Product added to wishlist!");
        // Optionally refresh wishlist UI or navigate to wishlist page
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  }
  
  // Add to cart
  async function addToCart(productId, quantity = 1) {
    if (!checkUserLoginStatus()) {
      alert("Please log in to add products to your cart.");
      window.location.href = "/login"; // Redirect to login page
      return;
    }
  
    try {
      const response = await fetch("/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
  
      if (response.ok) {
        alert("Product added to cart!");
        // Optionally refresh cart UI
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }
  
  // Fetch and display wishlist
  async function loadWishlist() {
    try {
      const response = await fetch("/wishlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const wishlistItems = await response.json();
        displayWishlistItems(wishlistItems);
      } else {
        const error = await response.json();
        console.error("Error fetching wishlist:", error.message);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  }
  
  // Display wishlist items in the UI
  function displayWishlistItems(items) {
    const wishlistContainer = document.getElementById("wishlistContainer");
    wishlistContainer.innerHTML = ""; // Clear existing content
  
    if (items.length === 0) {
      wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }
  
    items.forEach((item) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product-item");
      productElement.innerHTML = `
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
        <button onclick="removeFromWishlist(${item.id})">Remove</button>
      `;
      wishlistContainer.appendChild(productElement);
    });
  }
  
  // Remove item from wishlist
  async function removeFromWishlist(productId) {
    try {
      const response = await fetch(`/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Product removed from wishlist!");
        loadWishlist(); // Refresh wishlist
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  }
  
  // Fetch and display cart
  async function loadCart() {
    try {
      const response = await fetch("/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const cartItems = await response.json();
        displayCartItems(cartItems);
      } else {
        const error = await response.json();
        console.error("Error fetching cart:", error.message);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }
  
  // Display cart items in the UI
  function displayCartItems(items) {
    const cartContainer = document.getElementById("cartContainer");
    cartContainer.innerHTML = ""; // Clear existing content
  
    if (items.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }
  
    items.forEach((item) => {
      const productElement = document.createElement("div");
      productElement.classList.add("cart-item");
      productElement.innerHTML = `
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
        <p>Quantity: ${item.quantity}</p>
        <button onclick="removeFromCart(${item.id})">Remove</button>
      `;
      cartContainer.appendChild(productElement);
    });
  }
  
  // Remove item from cart
  async function removeFromCart(productId) {
    try {
      const response = await fetch(`/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Product removed from cart!");
        loadCart(); // Refresh cart
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  }
  