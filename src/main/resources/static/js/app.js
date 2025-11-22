// Cart management and API calls

// Store current user ID in sessionStorage
function setUserId(userId) {
    sessionStorage.setItem('userId', userId);
}

function getUserId() {
    return sessionStorage.getItem('userId');
}

function clearUserId() {
    sessionStorage.removeItem('userId');
}

// Check if user is logged in
function isLoggedIn() {
    return getUserId() !== null;
}

// Redirect to login if not logged in
function requireLogin() {
    if (!isLoggedIn()) {
        alert('Please login to continue');
        window.location.href = 'loginpage.html';
        return false;
    }
    return true;
}

// Add item to cart
async function addToCart(menuItemId, quantity = 1) {
    if (!requireLogin()) return;

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId()),
                menuItemId: menuItemId,
                quantity: quantity
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Item added to cart!');
            updateCartCount();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add item to cart');
    }
}

// Get cart items
async function getCart() {
    if (!isLoggedIn()) return null;

    try {
        const response = await fetch(`/api/cart?userId=${getUserId()}`);
        const result = await response.json();
        if (result.success) {
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Update cart item quantity
async function updateCartItem(cartItemId, quantity) {
    if (!requireLogin()) return;

    try {
        const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId()),
                cartItemId: cartItemId,
                quantity: quantity
            })
        });

        const result = await response.json();
        if (result.success) {
            return true;
        } else {
            alert('Error: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update cart');
        return false;
    }
}

// Remove item from cart
async function removeFromCart(cartItemId) {
    if (!requireLogin()) return;

    try {
        const response = await fetch(`/api/cart/remove?userId=${getUserId()}&cartItemId=${cartItemId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            return true;
        } else {
            alert('Error: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove item');
        return false;
    }
}

// Checkout
async function checkout() {
    if (!requireLogin()) return;

    if (!confirm('Are you sure you want to checkout?')) {
        return;
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId())
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Order placed successfully! Order ID: ' + result.orderId);
            window.location.href = 'index.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to checkout');
    }
}

// Update cart count badge (if exists)
async function updateCartCount() {
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        const cart = await getCart();
        if (cart && cart.items) {
            const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'inline' : 'none';
        }
    }
}

// Load menu items
async function loadMenuItems(category) {
    try {
        const url = category ? `/api/menu?category=${category}` : '/api/menu';
        const response = await fetch(url);
        const items = await response.json();
        return items;
    } catch (error) {
        console.error('Error loading menu items:', error);
        return [];
    }
}

// Format price
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

