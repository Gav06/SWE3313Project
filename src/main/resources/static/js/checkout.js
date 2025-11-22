// Checkout page JavaScript

// Load order summary
async function loadOrderSummary() {
    if (!isLoggedIn()) {
        document.getElementById('order-summary').innerHTML = `
            <p>Please login to checkout.</p>
            <button class="button" onclick="window.location.href='loginpage.html'">Go to Login</button>
        `;
        return;
    }

    const cart = await getCart();
    const container = document.getElementById('order-summary');

    if (!cart || !cart.items || cart.items.length === 0) {
        container.innerHTML = `
            <p>Your cart is empty.</p>
            <button class="button" onclick="window.location.href='cart.html'">Go to Cart</button>
        `;
        return;
    }

    let html = '';
    cart.items.forEach(item => {
        html += `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatPrice(item.subtotal)}</span>
            </div>
        `;
    });

    html += `
        <div class="order-total">
            <span>Total:</span>
            <span>${formatPrice(cart.total)}</span>
        </div>
    `;

    container.innerHTML = html;
}

// No validation - accept any data for testing

// Format card number with spaces (only digits)
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, ''); // Remove spaces and non-digits
    // Limit length based on card type (max 16 for most cards, 15 for Amex)
    const cardType = document.getElementById('cardType').value;
    const maxLength = cardType === 'American Express' ? 15 : 16;
    value = value.substring(0, maxLength);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
});

// Format expiry date (MM/YY format, only digits)
document.getElementById('cardExpiry')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Only digits
    value = value.substring(0, 4); // Max 4 digits
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
});

// Format CVV (only digits, length based on card type)
document.getElementById('cardCVV')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Only digits
    const cardType = document.getElementById('cardType').value;
    const maxLength = cardType === 'American Express' ? 4 : 3;
    value = value.substring(0, maxLength);
    e.target.value = value;
});

// Update CVV max length when card type changes
document.getElementById('cardType')?.addEventListener('change', function(e) {
    const cardType = e.target.value;
    const cvvInput = document.getElementById('cardCVV');
    const cvvHint = document.getElementById('cvv-hint');
    if (cvvInput) {
        if (cardType === 'American Express') {
            cvvInput.maxLength = 4;
            cvvInput.minLength = 4;
            cvvInput.placeholder = '1234';
            cvvInput.pattern = '\\d{4}';
            if (cvvHint) cvvHint.textContent = '4 digits for American Express';
        } else if (cardType) {
            cvvInput.maxLength = 3;
            cvvInput.minLength = 3;
            cvvInput.placeholder = '123';
            cvvInput.pattern = '\\d{3}';
            if (cvvHint) cvvHint.textContent = '3 digits for ' + cardType;
            // Limit current value if needed
            if (cvvInput.value.length > 3) {
                cvvInput.value = cvvInput.value.substring(0, 3);
            }
        }
    }
});

// Format ZIP code (only digits and dash)
document.getElementById('zipCode')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d-]/g, ''); // Only digits and dash
    // Format as 12345 or 12345-1234
    if (value.length > 5 && !value.includes('-')) {
        value = value.substring(0, 5) + '-' + value.substring(5, 9);
    }
    value = value.substring(0, 10); // Max 10 characters (12345-1234)
    e.target.value = value;
    updateFullAddress(); // Update full address field
});

// Format state (only letters, uppercase, max 2 characters)
document.getElementById('state')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase(); // Only letters, uppercase
    value = value.substring(0, 2); // Max 2 characters
    e.target.value = value;
    updateFullAddress(); // Update full address field
});

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Hide error message
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Show global error
function showGlobalError(message) {
    const errorElement = document.getElementById('global-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Hide global error
function hideGlobalError() {
    const errorElement = document.getElementById('global-error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Process checkout
async function processCheckout() {
    hideGlobalError();

    if (!isLoggedIn()) {
        showGlobalError('Please login to checkout');
        window.location.href = 'loginpage.html';
        return;
    }

    // Validation - check that fields are filled with correct format/length
    const cardType = document.getElementById('cardType').value;
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '').trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();
    
    // Validate required fields are filled and have correct format
    if (!cardType) {
        showGlobalError('Please select a card type');
        return;
    }
    
    // Validate card number length based on card type
    if (!cardNumber || cardNumber.length === 0) {
        showGlobalError('Please enter a card number');
        return;
    }
    
    // Check if card number contains only digits
    if (!/^\d+$/.test(cardNumber)) {
        showGlobalError('Card number must contain only numbers');
        return;
    }
    
    // Validate card number length based on card type
    let expectedCardLength;
    switch(cardType) {
        case 'Visa':
        case 'Mastercard':
        case 'Discover':
            expectedCardLength = 16;
            break;
        case 'American Express':
            expectedCardLength = 15;
            break;
        default:
            expectedCardLength = 16;
    }
    
    if (cardNumber.length !== expectedCardLength) {
        showGlobalError(`Card number must be ${expectedCardLength} digits for ${cardType}`);
        return;
    }
    
    // Validate expiry date format (MM/YY)
    if (!cardExpiry || cardExpiry.length === 0) {
        showGlobalError('Please enter an expiry date');
        return;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showGlobalError('Expiry date must be in MM/YY format (e.g., 12/25)');
        return;
    }
    
    // Validate CVV length based on card type
    if (!cardCVV || cardCVV.length === 0) {
        showGlobalError('Please enter a CVV');
        return;
    }
    
    // Check if CVV contains only digits
    if (!/^\d+$/.test(cardCVV)) {
        showGlobalError('CVV must contain only numbers');
        return;
    }
    
    // CVV length validation (3 for most cards, 4 for Amex)
    const expectedCVVLength = cardType === 'American Express' ? 4 : 3;
    if (cardCVV.length !== expectedCVVLength) {
        showGlobalError(`CVV must be ${expectedCVVLength} digits for ${cardType}`);
        return;
    }
    
    // Get delivery address - check that it's filled with correct format
    let deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const street = document.getElementById('streetAddress')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const zip = document.getElementById('zipCode')?.value.trim() || '';
    
    // Validate state (must be 2 characters)
    if (!state || state.length === 0) {
        showGlobalError('Please enter a state');
        return;
    }
    if (state.length !== 2) {
        showGlobalError('State must be 2 characters (e.g., NY, CA)');
        return;
    }
    
    // Validate ZIP code (must be 5 digits minimum)
    if (!zip || zip.length === 0) {
        showGlobalError('Please enter a ZIP code');
        return;
    }
    // Allow ZIP+4 format (5 digits or 5-4 digits)
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
        showGlobalError('ZIP code must be 5 digits (e.g., 10001 or 10001-1234)');
        return;
    }
    
    // Validate street address
    if (!street || street.length === 0) {
        showGlobalError('Please enter a street address');
        return;
    }
    
    // Validate city
    if (!city || city.length === 0) {
        showGlobalError('Please enter a city');
        return;
    }
    
    // Build delivery address from individual fields
    if (!deliveryAddress) {
        if (street && city && state && zip) {
            deliveryAddress = [street, city, state, zip].filter(part => part).join(', ');
        }
    }
    
    if (!deliveryAddress || deliveryAddress.length === 0) {
        showGlobalError('Please enter a complete delivery address');
        return;
    }

    // Get card info - use last 4 digits or first 4 if card number is short
    const cardLast4 = cardNumber.length >= 4 ? cardNumber.slice(-4) : cardNumber.padStart(4, '0').slice(-4);

    // Disable checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId()),
                deliveryAddress: deliveryAddress,
                cardType: cardType,
                cardLast4: cardLast4
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Order placed successfully! Order ID: ' + result.orderId);
            window.location.href = 'index.html';
        } else {
            showGlobalError('Error: ' + result.message);
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Confirm Order';
        }
    } catch (error) {
        console.error('Error:', error);
        showGlobalError('Failed to process checkout. Please try again.');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Confirm Order';
    }
}

// Load saved address if available
async function loadSavedAddress() {
    if (!isLoggedIn()) return;

    try {
        const response = await fetch(`/api/user/info?userId=${getUserId()}`);
        const result = await response.json();
        
        if (result.success && result.address) {
            document.getElementById('saved-address-text').textContent = result.address;
            // Pre-fill address fields if address exists
            if (result.address) {
                // Try to parse address (basic parsing - can be improved)
                const addressParts = result.address.split(',');
                if (addressParts.length >= 3) {
                    document.getElementById('streetAddress').value = addressParts[0].trim();
                    document.getElementById('city').value = addressParts[1].trim();
                    const stateZip = addressParts[2].trim().split(' ');
                    if (stateZip.length >= 2) {
                        document.getElementById('state').value = stateZip[0].trim();
                        document.getElementById('zipCode').value = stateZip[1].trim();
                    }
                    updateFullAddress();
                }
            }
        }
    } catch (error) {
        console.error('Error loading saved address:', error);
    }
}

// Toggle between saved address and manual entry
function toggleSavedAddress() {
    const useSaved = document.getElementById('useSavedAddress').checked;
    const addressFields = document.getElementById('address-fields');
    const savedAddressDisplay = document.getElementById('saved-address-display');
    const savedAddressText = document.getElementById('saved-address-text').textContent;

    if (useSaved) {
        if (!savedAddressText || savedAddressText.trim() === '') {
            alert('You don\'t have a saved address. Please add one in Account Settings or enter an address manually.');
            document.getElementById('useSavedAddress').checked = false;
            return;
        }
        addressFields.style.display = 'none';
        savedAddressDisplay.style.display = 'block';
        document.getElementById('deliveryAddress').value = savedAddressText;
    } else {
        addressFields.style.display = 'block';
        savedAddressDisplay.style.display = 'none';
        updateFullAddress();
    }
}

// Update full address field from individual fields
function updateFullAddress() {
    const street = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zipCode').value.trim();

    const fullAddress = [street, city, state, zip].filter(part => part).join(', ');
    document.getElementById('deliveryAddress').value = fullAddress;
}

// No address validation - accept any address for testing
function validateAddress() {
    // Just check that some address exists
    const deliveryAddress = document.getElementById('deliveryAddress')?.value.trim() || '';
    const useSaved = document.getElementById('useSavedAddress')?.checked || false;
    
    if (useSaved && deliveryAddress) {
        return true;
    }
    
    // Check manual fields - accept any non-empty values
    const street = document.getElementById('streetAddress')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const zip = document.getElementById('zipCode')?.value.trim() || '';
    
    if (street || city || state || zip || deliveryAddress) {
        return true;
    }
    
    return false;
}

// Initialize page on load
window.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    loadSavedAddress();
    
    // Set initial CVV length based on card type
    const cardTypeSelect = document.getElementById('cardType');
    if (cardTypeSelect) {
        const initialCardType = cardTypeSelect.value;
        if (initialCardType) {
            // Trigger change event to set CVV length
            cardTypeSelect.dispatchEvent(new Event('change'));
        }
    }
    
    // Add event listeners to address fields
    const streetInput = document.getElementById('streetAddress');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zipCode');

    if (streetInput) streetInput.addEventListener('input', updateFullAddress);
    if (cityInput) cityInput.addEventListener('input', updateFullAddress);
    if (stateInput) {
        stateInput.addEventListener('input', updateFullAddress);
    }
    if (zipInput) {
        zipInput.addEventListener('input', updateFullAddress);
    }
    
    // Update navigation buttons
    if (isLoggedIn()) {
        const accountBtn = document.getElementById('accountBtn');
        const loginBtn = document.getElementById('loginBtn');
        if (accountBtn) accountBtn.style.display = 'inline-block';
        if (loginBtn) loginBtn.textContent = 'Logout';
        if (loginBtn) loginBtn.onclick = function() {
            clearUserId();
            window.location.href = 'loginpage.html';
        };
    }
});

