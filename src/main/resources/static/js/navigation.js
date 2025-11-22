// Navigation helper functions

function updateNavigation() {
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    const isLoggedIn = userId !== null && userId !== undefined && userId !== '';
    
    // Update all navigation bars
    const navBars = document.querySelectorAll('.nav-buttons');
    navBars.forEach(navBar => {
        // Remove existing login indicator if any
        const existingIndicator = navBar.querySelector('.login-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'login-indicator';
        
        if (isLoggedIn && username) {
            indicator.innerHTML = `
                <span style="color: #4caf50; font-weight: bold;">✓ Logged in as: ${username}</span>
                <button class="button" onclick="logout()" style="margin-left: 10px;">Logout</button>
            `;
        } else {
            indicator.innerHTML = `
                <span style="color: #999; font-weight: bold;">Guest - Currently logged out</span>
            `;
        }
        navBar.appendChild(indicator);
    });
}

function logout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateNavigation);

