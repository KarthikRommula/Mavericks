// Authentication module for TechLearn platform

document.addEventListener('DOMContentLoaded', function() {
    // Wait for database to initialize
    if (window.userDB) {
        // Initialize UI components
        initAuthUI();
        
        // Check if user is already logged in
        updateUIBasedOnAuthState();
    } else {
        // If database is not available, wait for it
        const dbCheckInterval = setInterval(() => {
            if (window.userDB) {
                clearInterval(dbCheckInterval);
                initAuthUI();
                updateUIBasedOnAuthState();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(dbCheckInterval);
            console.error('Database initialization timed out');
            showNotification('Database initialization failed. Please refresh the page.', 'error');
        }, 5000);
    }
});

// Initialize authentication UI components
function initAuthUI() {
    // Add event listeners to login/signup buttons in the navbar
    const loginTriggers = document.querySelectorAll('.btn-login');
    const signupTriggers = document.querySelectorAll('.btn-signup');
    const logoutTriggers = document.querySelectorAll('.btn-logout');
    
    loginTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('login');
        });
    });
    
    signupTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal('signup');
        });
    });
    
    logoutTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Show authentication modal (login or signup)
function showAuthModal(type) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'auth-modal-container';
    
    // Create modal content based on type
    let modalContent = '';
    if (type === 'login') {
        modalContent = `
            <div class="auth-modal login-modal">
                <div class="auth-header">
                    <h2>Login to TechLearn</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="auth-body">
                    <form id="login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" required>
                        </div>
                        <div class="form-error" id="login-error"></div>
                        <button type="submit" class="btn-primary btn-block">Login</button>
                    </form>
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#" id="switch-to-signup">Sign up</a></p>
                    </div>
                </div>
            </div>
        `;
    } else {
        modalContent = `
            <div class="auth-modal signup-modal">
                <div class="auth-header">
                    <h2>Create an Account</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="auth-body">
                    <form id="signup-form">
                        <div class="form-group">
                            <label for="signup-username">Username</label>
                            <input type="text" id="signup-username" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password</label>
                            <input type="password" id="signup-password" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-confirm-password">Confirm Password</label>
                            <input type="password" id="signup-confirm-password" required>
                        </div>
                        <div class="form-error" id="signup-error"></div>
                        <button type="submit" class="btn-primary btn-block">Create Account</button>
                    </form>
                    <div class="auth-footer">
                        <p>Already have an account? <a href="#" id="switch-to-login">Login</a></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Set modal content
    modalContainer.innerHTML = modalContent;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
    
    // Switch between login and signup
    const switchToSignup = modalContainer.querySelector('#switch-to-signup');
    const switchToLogin = modalContainer.querySelector('#switch-to-login');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.removeChild(modalContainer);
            showAuthModal('signup');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.removeChild(modalContainer);
            showAuthModal('login');
        });
    }
    
    // Form submission
    const loginForm = modalContainer.querySelector('#login-form');
    const signupForm = modalContainer.querySelector('#signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(modalContainer);
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup(modalContainer);
        });
    }
}

// Handle login form submission
async function handleLogin(modalContainer) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorElement = document.getElementById('login-error');
    const loginButton = modalContainer.querySelector('button[type="submit"]');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate inputs
    if (!email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }
    
    // Disable button and show loading state
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }
    
    try {
        // Attempt login - check if it's a promise or direct result
        let result;
        if (typeof userDB.loginUser === 'function') {
            // Using IndexedDB implementation
            result = await userDB.loginUser(email, password);
        } else if (typeof userDB.login === 'function') {
            // Using localStorage implementation
            result = userDB.login(email, password);
        } else {
            throw new Error('Login functionality not available');
        }
        
        if (result.success) {
            // Close modal
            if (document.body.contains(modalContainer)) {
                document.body.removeChild(modalContainer);
            }
            
            // Update UI
            updateUIBasedOnAuthState();
            
            // Show success notification
            showNotification('Login successful. Welcome back!', 'success');
        } else {
            // Show error
            errorElement.textContent = result.message || 'Invalid email or password';
            
            // Reset button
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = error.message || 'An error occurred during login';
        
        // Reset button
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    }
}

// Handle signup form submission
async function handleSignup(modalContainer) {
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const errorElement = document.getElementById('signup-error');
    const signupButton = modalContainer.querySelector('button[type="submit"]');
    
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Disable button and show loading state
    if (signupButton) {
        signupButton.disabled = true;
        signupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    }
    
    try {
        // Attempt registration - check if it's a promise or direct result
        let result;
        if (typeof userDB.registerUser === 'function') {
            // Using IndexedDB implementation
            result = await userDB.registerUser({
                username: username,
                email: email,
                password: password
            });
        } else if (typeof userDB.register === 'function') {
            // Using localStorage implementation
            result = userDB.register(username, email, password);
        } else {
            throw new Error('Registration functionality not available');
        }
        
        if (result.success) {
            // Close modal
            if (document.body.contains(modalContainer)) {
                document.body.removeChild(modalContainer);
            }
            
            // Update UI
            updateUIBasedOnAuthState();
            
            // Show success notification
            showNotification('Account created successfully. Welcome to TechLearn!', 'success');
        } else {
            // Show error
            errorElement.textContent = result.message || 'Registration failed';
            
            // Reset button
            if (signupButton) {
                signupButton.disabled = false;
                signupButton.textContent = 'Sign Up';
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorElement.textContent = error.message || 'An error occurred during registration';
        
        // Reset button
        if (signupButton) {
            signupButton.disabled = false;
            signupButton.textContent = 'Sign Up';
        }
    }
}

// Logout user
async function logout() {
    try {
        // Check which logout method is available
        if (typeof userDB.logout === 'function') {
            userDB.logout();
        } else {
            console.warn('Logout method not found');
        }
        
        updateUIBasedOnAuthState();
        showNotification('You have been logged out', 'info');
        
        // Redirect to home page if on dashboard
        if (window.location.href.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error during logout. Please try again.', 'error');
    }
}

// Update UI based on authentication state
function updateUIBasedOnAuthState() {
    // Check if userDB exists and has the required methods
    if (!window.userDB) {
        console.warn('userDB not available for authentication state update');
        return;
    }
    
    // Check which method is available for checking login state
    let isLoggedIn = false;
    let currentUser = null;
    
    if (typeof userDB.isLoggedIn === 'function') {
        isLoggedIn = userDB.isLoggedIn();
        if (isLoggedIn && typeof userDB.getCurrentUser === 'function') {
            currentUser = userDB.getCurrentUser();
        }
    }
    
    // Update navbar
    const loginButtons = document.querySelectorAll('.btn-login');
    const signupButtons = document.querySelectorAll('.btn-signup');
    const userProfileElements = document.querySelectorAll('.user-profile');
    
    if (isLoggedIn) {
        // Hide login/signup buttons
        loginButtons.forEach(btn => {
            const li = btn.parentElement;
            li.style.display = 'none';
        });
        
        signupButtons.forEach(btn => {
            const li = btn.parentElement;
            li.style.display = 'none';
        });
        
        // Show user profile or create if it doesn't exist
        if (userProfileElements.length === 0) {
            // Create user profile element
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                const userProfileLi = document.createElement('li');
                userProfileLi.className = 'user-profile-container';
                userProfileLi.innerHTML = `
                    <div class="user-profile">
                        <span class="user-name">${currentUser.username}</span>
                        <div class="user-dropdown">
                            <ul>
                                <li><a href="#" class="user-saved-codes">My Saved Codes</a></li>
                                <li><a href="#" class="user-settings">Settings</a></li>
                                <li><a href="#" class="btn-logout">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                `;
                navMenu.appendChild(userProfileLi);
                
                // Add event listener to logout button
                const logoutBtn = userProfileLi.querySelector('.btn-logout');
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
                
                // Toggle dropdown
                const userProfile = userProfileLi.querySelector('.user-profile');
                userProfile.addEventListener('click', function(e) {
                    e.stopPropagation();
                    this.classList.toggle('active');
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function() {
                    userProfile.classList.remove('active');
                });
            }
        } else {
            // Update existing user profile
            userProfileElements.forEach(element => {
                const nameElement = element.querySelector('.user-name');
                if (nameElement) {
                    nameElement.textContent = currentUser.username;
                }
                element.parentElement.style.display = 'block';
            });
        }
    } else {
        // Show login/signup buttons
        loginButtons.forEach(btn => {
            const li = btn.parentElement;
            li.style.display = 'block';
        });
        
        signupButtons.forEach(btn => {
            const li = btn.parentElement;
            li.style.display = 'block';
        });
        
        // Hide user profile
        userProfileElements.forEach(element => {
            element.parentElement.style.display = 'none';
        });
    }
    
    // Update code playground if on that page
    updateCodePlaygroundForUser();
}

// Update code playground for logged in user
function updateCodePlaygroundForUser() {
    const isPlaygroundPage = document.querySelector('.playground-section') !== null;
    if (!isPlaygroundPage) return;
    
    // Check if database is available
    if (!window.userDB) {
        console.warn('Database not available for code playground update');
        return;
    }
    
    const isLoggedIn = userDB.isLoggedIn();
    const currentUser = userDB.getCurrentUser();
    
    const saveCodeBtn = document.getElementById('save-code-btn');
    const loadCodeBtn = document.getElementById('load-code-btn');
    
    if (saveCodeBtn) {
        if (isLoggedIn) {
            saveCodeBtn.disabled = false;
            saveCodeBtn.title = 'Save code to your account';
            
            // Add event listener for saving code if not already added
            if (!saveCodeBtn.hasAttribute('data-listener-added')) {
                saveCodeBtn.setAttribute('data-listener-added', 'true');
                saveCodeBtn.addEventListener('click', async function() {
                    const codeEditor = document.querySelector('.CodeMirror')?.CodeMirror;
                    const languageSelect = document.getElementById('language-select');
                    
                    if (codeEditor && languageSelect) {
                        const code = codeEditor.getValue();
                        const language = languageSelect.value;
                        
                        // Prompt for title
                        const title = prompt('Enter a title for your code snippet:', `${language} snippet - ${new Date().toLocaleString()}`);
                        if (!title) return; // User cancelled
                        
                        try {
                            await userDB.saveCodeSnippet(currentUser.email, code, language, title);
                            showNotification('Code saved successfully!', 'success');
                        } catch (error) {
                            console.error('Error saving code:', error);
                            showNotification('Failed to save code. Please try again.', 'error');
                        }
                    }
                });
            }
        } else {
            saveCodeBtn.disabled = true;
            saveCodeBtn.title = 'Login to save code';
        }
    }
    
    if (loadCodeBtn) {
        if (isLoggedIn) {
            loadCodeBtn.disabled = false;
            loadCodeBtn.title = 'Load saved code';
            
            // Add event listener for loading code if not already added
            if (!loadCodeBtn.hasAttribute('data-listener-added')) {
                loadCodeBtn.setAttribute('data-listener-added', 'true');
                loadCodeBtn.addEventListener('click', async function() {
                    try {
                        const snippets = await userDB.getUserCodeSnippets(currentUser.email);
                        
                        if (snippets.length === 0) {
                            showNotification('You have no saved code snippets', 'info');
                            return;
                        }
                        
                        // Create snippet selection modal
                        const modalContainer = document.createElement('div');
                        modalContainer.className = 'modal-container';
                        modalContainer.innerHTML = `
                            <div class="snippets-modal">
                                <div class="modal-header">
                                    <h3>Your Saved Code Snippets</h3>
                                    <button class="close-modal"><i class="fas fa-times"></i></button>
                                </div>
                                <div class="modal-body">
                                    <ul class="snippets-list">
                                        ${snippets.map(snippet => `
                                            <li data-id="${snippet.id}" data-language="${snippet.language}">
                                                <div class="snippet-info">
                                                    <h4>${snippet.title}</h4>
                                                    <p><span class="language-badge">${snippet.language}</span> <span class="date-badge">Last modified: ${new Date(snippet.lastModified).toLocaleString()}</span></p>
                                                </div>
                                                <div class="snippet-actions">
                                                    <button class="load-snippet-btn"><i class="fas fa-code"></i> Load</button>
                                                    <button class="delete-snippet-btn"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        `;
                        
                        document.body.appendChild(modalContainer);
                        
                        // Add event listeners
                        const closeBtn = modalContainer.querySelector('.close-modal');
                        closeBtn.addEventListener('click', function() {
                            document.body.removeChild(modalContainer);
                        });
                        
                        const loadButtons = modalContainer.querySelectorAll('.load-snippet-btn');
                        loadButtons.forEach(btn => {
                            btn.addEventListener('click', async function() {
                                const snippetId = parseInt(this.closest('li').getAttribute('data-id'));
                                const snippetLanguage = this.closest('li').getAttribute('data-language');
                                const snippet = snippets.find(s => s.id === snippetId);
                                
                                if (snippet) {
                                    const codeEditor = document.querySelector('.CodeMirror')?.CodeMirror;
                                    const languageSelect = document.getElementById('language-select');
                                    
                                    if (codeEditor && languageSelect) {
                                        // Set language
                                        languageSelect.value = snippetLanguage;
                                        languageSelect.dispatchEvent(new Event('change'));
                                        
                                        // Set code
                                        codeEditor.setValue(snippet.code);
                                        
                                        // Close modal
                                        document.body.removeChild(modalContainer);
                                        
                                        showNotification('Code loaded successfully!', 'success');
                                    }
                                }
                            });
                        });
                        
                        const deleteButtons = modalContainer.querySelectorAll('.delete-snippet-btn');
                        deleteButtons.forEach(btn => {
                            btn.addEventListener('click', async function() {
                                if (confirm('Are you sure you want to delete this snippet?')) {
                                    const snippetId = parseInt(this.closest('li').getAttribute('data-id'));
                                    
                                    try {
                                        await userDB.deleteCodeSnippet(snippetId);
                                        this.closest('li').remove();
                                        
                                        // If no snippets left, close modal
                                        const remainingSnippets = modalContainer.querySelectorAll('.snippets-list li');
                                        if (remainingSnippets.length === 0) {
                                            document.body.removeChild(modalContainer);
                                            showNotification('All snippets deleted', 'info');
                                        } else {
                                            showNotification('Snippet deleted successfully', 'success');
                                        }
                                    } catch (error) {
                                        console.error('Error deleting snippet:', error);
                                        showNotification('Failed to delete snippet', 'error');
                                    }
                                }
                            });
                        });
                    } catch (error) {
                        console.error('Error loading snippets:', error);
                        showNotification('Failed to load snippets', 'error');
                    }
                });
            }
        } else {
            loadCodeBtn.disabled = true;
            loadCodeBtn.title = 'Login to load saved code';
        }
    }
    
    // If user has preferences, apply them
    if (isLoggedIn && currentUser.preferences) {
        const codeEditor = document.querySelector('.CodeMirror')?.CodeMirror;
        if (codeEditor) {
            // Apply theme
            if (currentUser.preferences.theme) {
                codeEditor.setOption('theme', currentUser.preferences.theme);
            }
            
            // Apply font size
            if (currentUser.preferences.fontSize) {
                document.querySelector('.CodeMirror').style.fontSize = `${currentUser.preferences.fontSize}px`;
            }
            
            // Apply tab size
            if (currentUser.preferences.tabSize) {
                codeEditor.setOption('tabSize', currentUser.preferences.tabSize);
                codeEditor.setOption('indentUnit', currentUser.preferences.tabSize);
            }
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add event listener to close button
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(notification);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// Make showAuthModal available globally
window.showAuthModal = showAuthModal;

// Export auth functions for use in other modules
window.auth = {
    handleLogin,
    handleSignup,
    logout,
    updateUIBasedOnAuthState,
    showAuthModal,
    showNotification
};
