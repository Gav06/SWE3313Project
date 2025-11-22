// Navigation helper functions

function updateNavigation() {
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    const isLoggedIn = userId !== null && userId !== undefined && userId !== '';
    
    // Update all navigation bars
    const navBars = document.querySelectorAll('.nav-buttons');
    navBars.forEach(navBar => {
        // Remove existing login indicator and logout button if any
        const existingIndicator = navBar.querySelector('.login-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const existingLogout = navBar.querySelector('button[onclick="logout()"]');
        if (existingLogout) {
            existingLogout.remove();
        }
        
        // Find and handle login/logout buttons
        const buttons = navBar.querySelectorAll('.button');
        let loginButton = null;
        let settingsButton = null;
        
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();
            if (buttonText === 'Login' || buttonText.toLowerCase().includes('login')) {
                loginButton = button;
            }
            if (buttonText === 'Settings' || buttonText.toLowerCase().includes('settings')) {
                settingsButton = button;
            }
        });
        
        if (loginButton) {
            if (isLoggedIn) {
                // Hide login button
                loginButton.style.display = 'none';
                
                // Create logout button and insert it after Settings button
                if (settingsButton) {
                    const logoutButton = document.createElement('button');
                    logoutButton.className = 'button';
                    logoutButton.textContent = 'Logout';
                    logoutButton.onclick = logout;
                    settingsButton.parentNode.insertBefore(logoutButton, settingsButton.nextSibling);
                } else {
                    // If no settings button found, insert after login button position
                    const logoutButton = document.createElement('button');
                    logoutButton.className = 'button';
                    logoutButton.textContent = 'Logout';
                    logoutButton.onclick = logout;
                    loginButton.parentNode.insertBefore(logoutButton, loginButton.nextSibling);
                }
            } else {
                // Show login button
                loginButton.style.display = 'inline-block';
            }
        } else if (isLoggedIn) {
            // If no login button found but user is logged in, add logout button after Settings
            if (settingsButton) {
                const logoutButton = document.createElement('button');
                logoutButton.className = 'button';
                logoutButton.textContent = 'Logout';
                logoutButton.onclick = logout;
                settingsButton.parentNode.insertBefore(logoutButton, settingsButton.nextSibling);
            } else {
                // If no settings button, append to end
                const logoutButton = document.createElement('button');
                logoutButton.className = 'button';
                logoutButton.textContent = 'Logout';
                logoutButton.onclick = logout;
                navBar.appendChild(logoutButton);
            }
        }
    });
}

function logout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateNavigation);

