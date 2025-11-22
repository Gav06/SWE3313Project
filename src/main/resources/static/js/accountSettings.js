// Account Settings JavaScript

// Load user account information
async function loadAccountInfo() {
    if (!isLoggedIn()) {
        document.querySelector('.settings-container').innerHTML = `
            <div class="settings-section">
                <h2>Please Login</h2>
                <p>You need to be logged in to view your account settings.</p>
                <button class="button" onclick="window.location.href='loginpage.html'">Go to Login</button>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`/api/user/info?userId=${getUserId()}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('username').value = result.username || '';
            document.getElementById('email').value = result.email || '';
            document.getElementById('fullName').value = result.fullName || '';
            
            // Parse address into individual fields
            if (result.address) {
                parseAddressToFields(result.address);
                document.getElementById('address').value = result.address;
            } else {
                document.getElementById('address').value = '';
            }
        } else {
            showGlobalError('Failed to load account information');
        }
    } catch (error) {
        console.error('Error:', error);
        showGlobalError('Failed to load account information');
    }
}

// Update account information
async function updateAccountInfo() {
    hideAllMessages();

    const verifyPassword = document.getElementById('verifyPassword').value;
    if (!verifyPassword) {
        showError('verifyPasswordError', 'Password is required to make changes');
        showGlobalError('Please enter your password to confirm changes');
        return;
    }
    hideError('verifyPasswordError');

    const fullName = document.getElementById('fullName').value.trim();
    
    // Build address from individual fields
    const address = buildAddressFromFields();
    if (!address) {
        showGlobalError('Please enter a complete address');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        return;
    }

    const saveBtn = document.querySelector('[onclick="updateAccountInfo()"]');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const response = await fetch('/api/user/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId()),
                verifyPassword: verifyPassword,
                fullName: fullName,
                address: address
            })
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('accountSuccess', 'Account information updated successfully!');
            document.getElementById('verifyPassword').value = '';
            // Reload account info to reflect changes
            setTimeout(() => loadAccountInfo(), 1000);
        } else {
            if (result.message && result.message.includes('password')) {
                showError('verifyPasswordError', result.message);
                showGlobalError(result.message);
            } else {
                showGlobalError(result.message || 'Failed to update account information');
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    } catch (error) {
        console.error('Error:', error);
        showGlobalError('Failed to update account information. Please try again.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

// Update password
async function updatePassword() {
    hideAllMessages();

    const verifyPassword = document.getElementById('verifyPasswordForPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let isValid = true;

    // Validate current password
    if (!verifyPassword) {
        showError('verifyPasswordForPasswordError', 'Current password is required');
        isValid = false;
    } else {
        hideError('verifyPasswordForPasswordError');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        showError('newPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        hideError('newPasswordError');
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    } else {
        hideError('confirmPasswordError');
    }

    if (!isValid) {
        showGlobalError('Please fix the errors above');
        return;
    }

    const saveBtn = document.querySelector('[onclick="updatePassword()"]');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Changing Password...';

    try {
        const response = await fetch('/api/user/update-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(getUserId()),
                currentPassword: verifyPassword,
                newPassword: newPassword
            })
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('passwordSuccess', 'Password changed successfully!');
            document.getElementById('verifyPasswordForPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            if (result.message && result.message.includes('password')) {
                showError('verifyPasswordForPasswordError', result.message);
                showGlobalError(result.message);
            } else {
                showGlobalError(result.message || 'Failed to change password');
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Change Password';
        }
    } catch (error) {
        console.error('Error:', error);
        showGlobalError('Failed to change password. Please try again.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Change Password';
    }
}

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

// Show success message
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
}

// Hide all messages
function hideAllMessages() {
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.success-message').forEach(el => el.classList.remove('show'));
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

// Parse address string into individual fields
function parseAddressToFields(addressString) {
    if (!addressString) return;
    
    const parts = addressString.split(',');
    if (parts.length >= 3) {
        document.getElementById('addressStreet').value = parts[0].trim();
        document.getElementById('addressCity').value = parts[1].trim();
        const stateZip = parts[2].trim().split(' ');
        if (stateZip.length >= 2) {
            document.getElementById('addressState').value = stateZip[0].trim().toUpperCase();
            document.getElementById('addressZip').value = stateZip[1].trim();
        } else if (stateZip.length === 1) {
            // Just state or just zip
            if (/^\d{5}(-\d{4})?$/.test(stateZip[0])) {
                document.getElementById('addressZip').value = stateZip[0].trim();
            } else {
                document.getElementById('addressState').value = stateZip[0].trim().toUpperCase();
            }
        }
    } else {
        // If address doesn't follow standard format, put it in street field
        document.getElementById('addressStreet').value = addressString;
    }
}

// Build address string from individual fields
function buildAddressFromFields() {
    const street = document.getElementById('addressStreet')?.value.trim() || '';
    const city = document.getElementById('addressCity')?.value.trim() || '';
    const state = document.getElementById('addressState')?.value.trim().toUpperCase() || '';
    const zip = document.getElementById('addressZip')?.value.trim() || '';

    if (!street && !city && !state && !zip) {
        return null; // Empty address is allowed
    }

    if (street && city && state && zip) {
        const fullAddress = `${street}, ${city}, ${state} ${zip}`;
        document.getElementById('address').value = fullAddress;
        return fullAddress;
    }

    // If incomplete, return what we have
    const parts = [street, city, state, zip].filter(part => part);
    const fullAddress = parts.join(', ');
    document.getElementById('address').value = fullAddress;
    return fullAddress;
}

// Update address field when individual fields change
function updateAddressField() {
    buildAddressFromFields();
}

// Load account info on page load
window.addEventListener('DOMContentLoaded', function() {
    loadAccountInfo();
    
    // Add event listeners to address fields
    const streetInput = document.getElementById('addressStreet');
    const cityInput = document.getElementById('addressCity');
    const stateInput = document.getElementById('addressState');
    const zipInput = document.getElementById('addressZip');

    if (streetInput) streetInput.addEventListener('input', updateAddressField);
    if (cityInput) cityInput.addEventListener('input', updateAddressField);
    if (stateInput) {
        stateInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
            updateAddressField();
        });
    }
    if (zipInput) zipInput.addEventListener('input', updateAddressField);
    
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

