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
        showError('Please login to continue', function() {
            window.location.href = 'loginpage.html';
        });
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
            showSuccess('Item added to cart!');
            updateCartCount();
        } else {
            // Check if it's a quantity limit error
            if (result.message && result.message.includes('Order limit is 25')) {
                showWarning('Order limit is 25 items per menu item. Maximum quantity reached.');
            } else {
                showError('Error: ' + result.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to add item to cart');
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
            // Check if it's a quantity limit error
            if (result.message && result.message.includes('Order limit is 25')) {
                showWarning('Order limit is 25 items per menu item. Maximum quantity reached.');
            } else {
                showError('Error: ' + result.message);
            }
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to update cart');
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
            showError('Error: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to remove item');
        return false;
    }
}

// Checkout
async function checkout() {
    if (!requireLogin()) return;

    showConfirm('Are you sure you want to checkout?', function(confirmed) {
        if (!confirmed) return;
        
        // This function is deprecated - checkout is now handled in checkout.js
        showWarning('Please use the checkout page to complete your order');
    });
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

// Load modal.js functions if available
if (typeof showError === 'undefined') {
    // Fallback functions if modal.js is not loaded
    function showError(message, callback) {
        alert('Error: ' + message);
        if (callback) callback();
    }
    function showSuccess(message, callback) {
        alert(message);
        if (callback) callback();
    }
    function showWarning(message, callback) {
        alert('Warning: ' + message);
        if (callback) callback();
    }
    function showConfirm(message, callback) {
        if (confirm(message)) {
            if (callback) callback(true);
        } else {
            if (callback) callback(false);
        }
    }
}

