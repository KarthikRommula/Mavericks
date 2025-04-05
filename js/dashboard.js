// Dashboard Module for TechLearn Platform
// Provides user dashboard functionality for tracking progress and managing courses

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard if we're on the dashboard page
    if (document.querySelector('.dashboard-container')) {
        initDashboard();
    }

    // Initialize dashboard
    async function initDashboard() {
        // Check if userDB is available
        if (!window.userDB) {
            // Wait for database to initialize
            await waitForDatabase();
        }
        
        // Check if user is logged in
        if (!window.userDB.isLoggedIn()) {
            redirectToLogin();
            return;
        }

        // Get current user
        const currentUser = window.userDB.getCurrentUser();
        
        // Update user info in the dashboard
        updateUserInfo(currentUser);
        
        // Load user's courses and progress
        await loadUserCourses(currentUser);
        
        // Load user's code snippets
        await loadUserCodeSnippets(currentUser);
        
        // Load recent activity
        await loadRecentActivity(currentUser);
        
        // Initialize event listeners
        initEventListeners();
    }

    // Wait for database to initialize
    async function waitForDatabase() {
        return new Promise((resolve) => {
            const maxWaitTime = 5000; // 5 seconds max wait time
            const checkInterval = 100; // Check every 100ms
            let elapsedTime = 0;
            
            const dbCheckInterval = setInterval(() => {
                if (window.userDB) {
                    clearInterval(dbCheckInterval);
                    resolve(window.userDB);
                }
                
                elapsedTime += checkInterval;
                if (elapsedTime >= maxWaitTime) {
                    clearInterval(dbCheckInterval);
                    console.error('Database initialization timed out');
                    resolve(null);
                }
            }, checkInterval);
        });
    }
    
    // Redirect to login page
    function redirectToLogin() {
        // Show message
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="login-required">
                    <h2>Login Required</h2>
                    <p>Please log in to access your dashboard.</p>
                    <button id="dashboard-login-btn" class="btn-primary">Login</button>
                </div>
            `;
            
            // Add event listener to login button
            const loginBtn = document.getElementById('dashboard-login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', function() {
                    if (typeof window.showAuthModal === 'function') {
                        window.showAuthModal('login');
                    } else if (typeof window.userDB.showAuthModal === 'function') {
                        window.userDB.showAuthModal('login');
                    } else {
                        // If no auth modal function is available, redirect to index page
                        window.location.href = 'index.html';
                    }
                });
            }
        }
    }

    // Update user info in the dashboard
    function updateUserInfo(user) {
        const userNameElements = document.querySelectorAll('.dashboard-user-name');
        const userEmailElements = document.querySelectorAll('.dashboard-user-email');
        const userAvatarElements = document.querySelectorAll('.dashboard-user-avatar');
        
        // Update user name
        userNameElements.forEach(element => {
            element.textContent = user.username;
        });
        
        // Update user email
        userEmailElements.forEach(element => {
            element.textContent = user.email;
        });
        
        // Update user avatar (using first letter of username)
        userAvatarElements.forEach(element => {
            element.textContent = user.username.charAt(0).toUpperCase();
        });
        
        // Update join date if present
        const joinDateElement = document.querySelector('.dashboard-join-date');
        if (joinDateElement && user.dateRegistered) {
            const joinDate = new Date(user.dateRegistered);
            joinDateElement.textContent = joinDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        // Update last login if present
        const lastLoginElement = document.querySelector('.dashboard-last-login');
        if (lastLoginElement && user.lastLogin) {
            const lastLogin = new Date(user.lastLogin);
            lastLoginElement.textContent = lastLogin.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Load user's courses and progress
    async function loadUserCourses(user) {
        const coursesContainer = document.querySelector('.dashboard-courses');
        if (!coursesContainer) return;
        
        try {
            // Show loading state
            coursesContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading courses...</div>';
            
            // Get user's courses from database
            const courses = await getUserCourses(user.email);
            
            // If no courses, show empty state
            if (!courses || courses.length === 0) {
                coursesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>No courses yet</h3>
                        <p>You haven't enrolled in any courses yet.</p>
                        <a href="courses.html" class="btn-primary">Browse Courses</a>
                    </div>
                `;
                return;
            }
            
            // Render courses
            let coursesHTML = '<div class="dashboard-courses-grid">';
            
            courses.forEach(course => {
                const progressPercent = course.progress ? Math.round(course.progress * 100) : 0;
                
                coursesHTML += `
                    <div class="dashboard-course-card">
                        <div class="course-image">
                            <img src="${course.image || 'https://placehold.co/300x200?text=Course+Image'}" alt="${course.title}">
                        </div>
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <p class="course-category">${course.category}</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${progressPercent}%"></div>
                            </div>
                            <p class="progress-text">${progressPercent}% Complete</p>
                        </div>
                        <a href="course-details.html?id=${course.id}" class="btn-secondary">Continue</a>
                    </div>
                `;
            });
            
            coursesHTML += '</div>';
            coursesContainer.innerHTML = coursesHTML;
            
        } catch (error) {
            console.error('Error loading courses:', error);
            coursesContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading courses</h3>
                    <p>${error.message || 'An error occurred while loading your courses.'}</p>
                    <button class="btn-secondary retry-btn">Retry</button>
                </div>
            `;
            
            // Add retry button event listener
            const retryBtn = coursesContainer.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    loadUserCourses(user);
                });
            }
        }
    }

    // Get user's courses from database
    async function getUserCourses(userId) {
        // If we have a proper database implementation
        if (window.userDB && window.userDB.getUserCourses) {
            return await window.userDB.getUserCourses(userId);
        }
        
        // Mock data for demonstration
        return [
            {
                id: 1,
                title: 'Data Structures and Algorithms',
                category: 'Computer Science',
                image: 'https://source.unsplash.com/random/300x200/?algorithm,data',
                progress: 0.75
            },
            {
                id: 2,
                title: 'Circuit Design Fundamentals',
                category: 'Electrical Engineering',
                image: 'https://source.unsplash.com/random/300x200/?circuit,electronics',
                progress: 0.3
            },
            {
                id: 3,
                title: 'Machine Learning Basics',
                category: 'Artificial Intelligence',
                image: 'https://source.unsplash.com/random/300x200/?ai,machine-learning',
                progress: 0.1
            }
        ];
    }

    // Load user's code snippets
    async function loadUserCodeSnippets(user) {
        const snippetsContainer = document.querySelector('.dashboard-code-snippets');
        if (!snippetsContainer) return;
        
        try {
            // Show loading state
            snippetsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading code snippets...</div>';
            
            // Get user's code snippets
            let snippets = [];
            
            // If we have a proper database implementation with getSavedCodes or getUserCodeSnippets
            if (window.userDB) {
                if (typeof window.userDB.getSavedCodes === 'function') {
                    const result = await window.userDB.getSavedCodes();
                    if (result && result.success) {
                        snippets = result.codes;
                    }
                } else if (typeof window.userDB.getUserCodeSnippets === 'function') {
                    try {
                        snippets = await window.userDB.getUserCodeSnippets(user.email || user.id);
                    } catch (error) {
                        console.error('Error getting code snippets:', error);
                    }
                }
            }
            
            // If no snippets, show empty state
            if (!snippets || snippets.length === 0) {
                snippetsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-code"></i>
                        <h3>No code snippets yet</h3>
                        <p>You haven't saved any code snippets yet.</p>
                        <a href="code-playground.html" class="btn-primary">Go to Code Playground</a>
                    </div>
                `;
                return;
            }
            
            // Render snippets
            let snippetsHTML = '<div class="dashboard-snippets-list">';
            
            // Sort snippets by date (newest first)
            snippets.sort((a, b) => {
                const dateA = a.updatedAt || a.createdAt;
                const dateB = b.updatedAt || b.createdAt;
                return new Date(dateB) - new Date(dateA);
            });
            
            // Take only the 5 most recent snippets
            const recentSnippets = snippets.slice(0, 5);
            
            recentSnippets.forEach(snippet => {
                const date = new Date(snippet.updatedAt || snippet.createdAt);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                snippetsHTML += `
                    <div class="snippet-item" data-id="${snippet.id}">
                        <div class="snippet-info">
                            <h4>${snippet.title}</h4>
                            <div class="snippet-meta">
                                <span class="language-badge">${snippet.language}</span>
                                <span class="date-badge">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="snippet-actions">
                            <button class="load-snippet-btn"><i class="fas fa-code"></i> Open</button>
                        </div>
                    </div>
                `;
            });
            
            snippetsHTML += '</div>';
            
            if (snippets.length > 5) {
                snippetsHTML += `<a href="code-snippets.html" class="view-all-link">View all ${snippets.length} snippets <i class="fas fa-arrow-right"></i></a>`;
            }
            
            snippetsContainer.innerHTML = snippetsHTML;
            
            // Add event listeners to snippet buttons
            const loadButtons = snippetsContainer.querySelectorAll('.load-snippet-btn');
            loadButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const snippetId = this.closest('.snippet-item').getAttribute('data-id');
                    window.location.href = `code-playground.html?snippet=${snippetId}`;
                });
            });
            
        } catch (error) {
            console.error('Error loading code snippets:', error);
            snippetsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading code snippets</h3>
                    <p>${error.message || 'An error occurred while loading your code snippets.'}</p>
                    <button class="btn-secondary retry-btn">Retry</button>
                </div>
            `;
            
            // Add retry button event listener
            const retryBtn = snippetsContainer.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    loadUserCodeSnippets(user);
                });
            }
        }
    }

    // Load recent activity
    async function loadRecentActivity(user) {
        const activityContainer = document.querySelector('.dashboard-activity');
        if (!activityContainer) return;
        
        try {
            // Show loading state
            activityContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading activity...</div>';
            
            // Get user's recent activity
            const activities = await getUserActivity(user.email);
            
            // If no activity, show empty state
            if (!activities || activities.length === 0) {
                activityContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No recent activity</h3>
                        <p>Your recent activity will appear here.</p>
                    </div>
                `;
                return;
            }
            
            // Render activity
            let activityHTML = '<div class="activity-timeline">';
            
            activities.forEach(activity => {
                const date = new Date(activity.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let iconClass = 'fa-circle';
                switch (activity.type) {
                    case 'course':
                        iconClass = 'fa-book';
                        break;
                    case 'code':
                        iconClass = 'fa-code';
                        break;
                    case 'quiz':
                        iconClass = 'fa-question-circle';
                        break;
                    case 'login':
                        iconClass = 'fa-sign-in-alt';
                        break;
                }
                
                activityHTML += `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="activity-content">
                            <p>${activity.description}</p>
                            <span class="activity-time">${formattedDate}</span>
                        </div>
                    </div>
                `;
            });
            
            activityHTML += '</div>';
            activityContainer.innerHTML = activityHTML;
            
        } catch (error) {
            console.error('Error loading activity:', error);
            activityContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading activity</h3>
                    <p>${error.message || 'An error occurred while loading your recent activity.'}</p>
                    <button class="btn-secondary retry-btn">Retry</button>
                </div>
            `;
            
            // Add retry button event listener
            const retryBtn = activityContainer.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    loadRecentActivity(user);
                });
            }
        }
    }

    // Get user's recent activity
    async function getUserActivity(userId) {
        // If we have a proper database implementation
        if (window.userDB && window.userDB.getUserActivity) {
            return await window.userDB.getUserActivity(userId);
        }
        
        // Mock data for demonstration
        const now = new Date();
        return [
            {
                id: 1,
                type: 'login',
                description: 'Logged in to the platform',
                timestamp: new Date(now.getTime() - 5 * 60000).toISOString() // 5 minutes ago
            },
            {
                id: 2,
                type: 'course',
                description: 'Started lesson 3 in "Data Structures and Algorithms"',
                timestamp: new Date(now.getTime() - 30 * 60000).toISOString() // 30 minutes ago
            },
            {
                id: 3,
                type: 'code',
                description: 'Saved code snippet "Binary Search Implementation"',
                timestamp: new Date(now.getTime() - 2 * 3600000).toISOString() // 2 hours ago
            },
            {
                id: 4,
                type: 'quiz',
                description: 'Completed quiz in "Circuit Design Fundamentals" with score 85%',
                timestamp: new Date(now.getTime() - 5 * 3600000).toISOString() // 5 hours ago
            },
            {
                id: 5,
                type: 'course',
                description: 'Enrolled in "Machine Learning Basics"',
                timestamp: new Date(now.getTime() - 24 * 3600000).toISOString() // 1 day ago
            }
        ];
    }

    // Initialize event listeners
    function initEventListeners() {
        // Settings toggle
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsPanel = document.querySelector('.dashboard-settings');
        
        if (settingsToggle && settingsPanel) {
            settingsToggle.addEventListener('click', function() {
                settingsPanel.classList.toggle('active');
            });
            
            // Close settings when clicking outside
            document.addEventListener('click', function(event) {
                if (!settingsPanel.contains(event.target) && !settingsToggle.contains(event.target)) {
                    settingsPanel.classList.remove('active');
                }
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Set initial state
            const currentUser = window.userDB && window.userDB.getCurrentUser ? window.userDB.getCurrentUser() : null;
            if (currentUser && currentUser.preferences && currentUser.preferences.theme) {
                themeToggle.checked = currentUser.preferences.theme === 'dark';
                // Apply theme to body immediately
                document.body.classList.toggle('dark-theme', themeToggle.checked);
            }
            
            themeToggle.addEventListener('change', function() {
                const theme = this.checked ? 'dark' : 'light';
                updateUserPreference('theme', theme);
                
                // Apply theme to body
                document.body.classList.toggle('dark-theme', this.checked);
            });
        }
        
        // Font size controls
        const fontSizeControls = document.querySelectorAll('.font-size-control');
        if (fontSizeControls.length > 0) {
            fontSizeControls.forEach(control => {
                control.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    const currentUser = window.userDB && window.userDB.getCurrentUser ? window.userDB.getCurrentUser() : null;
                    let fontSize = currentUser && currentUser.preferences ? (currentUser.preferences.fontSize || 14) : 14;
                    
                    if (action === 'increase') {
                        fontSize = Math.min(fontSize + 1, 24); // Max 24px
                    } else if (action === 'decrease') {
                        fontSize = Math.max(fontSize - 1, 10); // Min 10px
                    } else if (action === 'reset') {
                        fontSize = 14; // Default
                    }
                    
                    updateUserPreference('fontSize', fontSize);
                    
                    // Update font size display
                    const fontSizeDisplay = document.querySelector('.font-size-value');
                    if (fontSizeDisplay) {
                        fontSizeDisplay.textContent = fontSize + 'px';
                    }
                });
            });
        }
    }

    // Update user preference
    async function updateUserPreference(key, value) {
        if (!window.userDB || !window.userDB.isLoggedIn || !window.userDB.isLoggedIn() || !window.userDB.updateUserPreferences) {
            console.warn('Cannot update user preferences: database or user not available');
            return;
        }
        
        try {
            const currentUser = window.userDB.getCurrentUser();
            const preferences = { [key]: value };
            
            const result = await window.userDB.updateUserPreferences(currentUser.email, preferences);
            
            if (result.success) {
                console.log(`Updated user preference: ${key} = ${value}`);
                
                // Apply preference immediately
                applyUserPreference(key, value);
            }
        } catch (error) {
            console.error('Error updating user preference:', error);
        }
    }

    // Apply user preference
    function applyUserPreference(key, value) {
        switch (key) {
            case 'theme':
                document.body.classList.toggle('dark-theme', value === 'dark');
                break;
                
            case 'fontSize':
                document.documentElement.style.setProperty('--base-font-size', `${value}px`);
                break;
        }
    }

    // Export dashboard functions
    window.dashboard = {
        initDashboard,
        updateUserInfo,
        loadUserCourses,
        loadUserCodeSnippets,
        loadRecentActivity
    };
});
