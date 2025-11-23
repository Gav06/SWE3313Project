// Custom Modal Alert System

function createModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Alert</h3>
            </div>
            <div class="modal-body">
                <p id="modal-message"></p>
            </div>
            <div class="modal-footer">
                <button id="modal-ok-btn" class="modal-btn modal-btn-primary" onclick="closeModal()">OK</button>
                <button id="modal-cancel-btn" class="modal-btn modal-btn-secondary" onclick="closeModal()" style="display: none;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function showModal(title, message, type = 'info', callback = null, showCancel = false) {
    const modal = createModal();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    const okBtn = document.getElementById('modal-ok-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
    if (showCancel) {
        cancelBtn.style.display = 'inline-block';
    }
    
    // Style based on type
    const modalContent = document.querySelector('.modal-content');
    if (type === 'error') {
        modalContent.style.borderTop = '4px solid #d32f2f';
    } else if (type === 'success') {
        modalContent.style.borderTop = '4px solid #4caf50';
    } else if (type === 'warning') {
        modalContent.style.borderTop = '4px solid #ff9800';
    }
    
    okBtn.onclick = function() {
        closeModal();
        if (callback) callback(true);
    };
    
    if (showCancel) {
        cancelBtn.onclick = function() {
            closeModal();
            if (callback) callback(false);
        };
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Convenience functions
function showAlert(message, type = 'info', callback = null) {
    showModal('Alert', message, type, callback);
}

function showError(message, callback = null) {
    showModal('Error', message, 'error', callback);
}

function showSuccess(message, callback = null) {
    showModal('Success', message, 'success', callback);
}

function showWarning(message, callback = null) {
    showModal('Warning', message, 'warning', callback);
}

function showConfirm(message, callback) {
    showModal('Confirm', message, 'info', callback, true);
}

// Add CSS for modal
const modalCSS = `
<style id="modal-styles">
    #custom-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    #custom-modal.show {
        opacity: 1;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }
    
    .modal-content {
        position: relative;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        z-index: 10001;
    }
    
    #custom-modal.show .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        padding: 20px 25px;
        border-bottom: 1px solid #ddd;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 24px;
        font-family: 'Gabriola', 'Cormorant Garamond', serif;
    }
    
    .modal-body {
        padding: 25px;
    }
    
    .modal-body p {
        margin: 0;
        color: #666;
        font-size: 16px;
        line-height: 1.6;
        font-family: 'Gabriola', 'Cormorant Garamond', serif;
    }
    
    .modal-footer {
        padding: 15px 25px;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-family: 'Gabriola', 'Cormorant Garamond', serif;
        transition: background-color 0.3s;
    }
    
    .modal-btn-primary {
        background-color: #d32f2f;
        color: white;
    }
    
    .modal-btn-primary:hover {
        background-color: #b71c1c;
    }
    
    .modal-btn-secondary {
        background-color: #666;
        color: white;
    }
    
    .modal-btn-secondary:hover {
        background-color: #555;
    }
</style>
`;

// Inject CSS if not already present
if (!document.getElementById('modal-styles')) {
    document.head.insertAdjacentHTML('beforeend', modalCSS);
}

