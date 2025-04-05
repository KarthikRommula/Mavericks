// Database module for TechLearn platform
// Provides persistent storage for user data and authentication

class Database {
    constructor() {
        this.dbName = 'techLearnDB';
        this.userStoreName = 'users';
        this.codeSnippetsStoreName = 'codeSnippets';
        this.coursesStoreName = 'courses';
        this.progressStoreName = 'userProgress';
        this.db = null;
        this.isInitialized = false;
        this.initializationError = null;
        this.initializationCallbacks = [];
        
        // Start initialization process
        this.initDBPromise = this.initDB();
        
        // Set up global initialization status
        window.dbInitStatus = {
            initialized: false,
            error: null,
            waitForInitialization: async () => {
                return this.waitForInitialization();
            }
        };
    }

    // Initialize the IndexedDB database
    async initDB() {
        try {
            return new Promise((resolve, reject) => {
                console.log('Initializing TechLearn database...');
                const request = indexedDB.open(this.dbName, 2); // Increased version number for schema updates

                request.onerror = (event) => {
                    const error = event.target.error;
                    console.error('Database initialization error:', error);
                    this.initializationError = error;
                    window.dbInitStatus.error = error;
                    
                    // Notify any waiting callbacks about the error
                    this.initializationCallbacks.forEach(callback => {
                        callback.reject(error);
                    });
                    this.initializationCallbacks = [];
                    
                    reject(error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.isInitialized = true;
                    window.dbInitStatus.initialized = true;
                    console.log('Database opened successfully');
                    
                    // Notify any waiting callbacks
                    this.initializationCallbacks.forEach(callback => {
                        callback.resolve(this.db);
                    });
                    this.initializationCallbacks = [];
                    
                    resolve(this.db);
                };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;
                
                console.log(`Database upgrade needed: from version ${oldVersion} to version ${event.newVersion}`);
                
                // Create or update stores based on version
                if (oldVersion < 1) {
                    console.log('Creating initial database schema...');
                    // Create users object store
                    if (!db.objectStoreNames.contains(this.userStoreName)) {
                        const userStore = db.createObjectStore(this.userStoreName, { keyPath: 'email' });
                        userStore.createIndex('username', 'username', { unique: true });
                        userStore.createIndex('email', 'email', { unique: true });
                        console.log('Users store created');
                    }
    
                    // Create code snippets object store
                    if (!db.objectStoreNames.contains(this.codeSnippetsStoreName)) {
                        const snippetsStore = db.createObjectStore(this.codeSnippetsStoreName, { keyPath: 'id', autoIncrement: true });
                        snippetsStore.createIndex('userId', 'userId', { unique: false });
                        snippetsStore.createIndex('language', 'language', { unique: false });
                        snippetsStore.createIndex('dateCreated', 'dateCreated', { unique: false });
                        console.log('Code snippets store created');
                    }
                }
                
                if (oldVersion < 2) {
                    // Create courses object store
                    if (!db.objectStoreNames.contains(this.coursesStoreName)) {
                        const coursesStore = db.createObjectStore(this.coursesStoreName, { keyPath: 'id', autoIncrement: true });
                        coursesStore.createIndex('title', 'title', { unique: false });
                        coursesStore.createIndex('category', 'category', { unique: false });
                        coursesStore.createIndex('level', 'level', { unique: false });
                        console.log('Courses store created');
                    }
                    
                    // Create user progress object store
                    if (!db.objectStoreNames.contains(this.progressStoreName)) {
                        const progressStore = db.createObjectStore(this.progressStoreName, { keyPath: 'id', autoIncrement: true });
                        progressStore.createIndex('userId', 'userId', { unique: false });
                        progressStore.createIndex('courseId', 'courseId', { unique: false });
                        // Compound index for userId + courseId
                        progressStore.createIndex('userCourse', ['userId', 'courseId'], { unique: true });
                        console.log('User progress store created');
                    }
                }
            };
        });
        } catch (error) {
            console.error('Critical database initialization error:', error);
            this.initializationError = error;
            window.dbInitStatus.error = error;
            throw error;
        }
    }
    
    // Wait for database initialization to complete
    async waitForInitialization() {
        // If already initialized, return immediately
        if (this.isInitialized) {
            return this.db;
        }
        
        // If there was an error, throw it
        if (this.initializationError) {
            throw this.initializationError;
        }
        
        // Otherwise, wait for initialization to complete
        return new Promise((resolve, reject) => {
            this.initializationCallbacks.push({ resolve, reject });
        });
    }

    // User Management Methods
    
    // Register a new user with validation
    async registerUser(userData) {
        // Wait for DB initialization
        await this.waitForInitialization();
        
        // Validate required fields
        if (!userData.email || !userData.username || !userData.password) {
            throw new Error('Missing required user data');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }
        
        // Validate username (alphanumeric, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(userData.username)) {
            throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
        }
        
        // Validate password strength
        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Hash the password (in a real app, use a proper hashing library)
        userData.password = await this.hashPassword(userData.password);
        
        // Add default user preferences
        userData.preferences = {
            theme: 'dracula',
            fontSize: 14,
            tabSize: 4
        };
        
        // Add user metadata
        userData.dateRegistered = new Date().toISOString();
        userData.lastLogin = new Date().toISOString();
        userData.role = userData.role || 'student';
        userData.profileComplete = false;
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.userStoreName], 'readwrite');
                const userStore = transaction.objectStore(this.userStoreName);
                
                // Check if user already exists
                const emailCheck = userStore.get(userData.email);
                
                emailCheck.onsuccess = (event) => {
                    if (event.target.result) {
                        reject(new Error('User with this email already exists'));
                        return;
                    }
                    
                    // Check username
                    const usernameIndex = userStore.index('username');
                    const usernameCheck = usernameIndex.get(userData.username);
                    
                    usernameCheck.onsuccess = (event) => {
                        if (event.target.result) {
                            reject(new Error('Username already taken'));
                            return;
                        }
                        
                        // Add the user
                        const addRequest = userStore.add(userData);
                        
                        addRequest.onsuccess = () => {
                            // Create a safe user object without password
                            const safeUser = { ...userData };
                            delete safeUser.password;
                            
                            // Set as current user
                            this.setCurrentUser(safeUser);
                            
                            resolve(safeUser);
                        };
                        
                        addRequest.onerror = (event) => {
                            console.error('Error adding user:', event.target.error);
                            reject(event.target.error);
                        };
                    };
                    
                    usernameCheck.onerror = (event) => {
                        console.error('Error checking username:', event.target.error);
                        reject(event.target.error);
                    };
                };
                
                emailCheck.onerror = (event) => {
                    console.error('Error checking email:', event.target.error);
                    reject(event.target.error);
                };
                
                transaction.onerror = (event) => {
                    console.error('Transaction error:', event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('Registration error:', error);
                reject(error);
            }
        });
    }
    
    // Login user with improved error handling
    async loginUser(email, password) {
        // Wait for DB initialization
        await this.waitForInitialization();
        
        // Validate email
        if (!email || typeof email !== 'string') {
            throw new Error('Valid email is required');
        }
        
        // Validate password
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.userStoreName], 'readwrite'); // Changed to readwrite to update last login
                const userStore = transaction.objectStore(this.userStoreName);
                const request = userStore.get(email);
                
                request.onsuccess = async (event) => {
                    const user = event.target.result;
                    
                    if (!user) {
                        reject(new Error('Invalid email or password'));
                        return;
                    }
                    
                    try {
                        // Verify password
                        const isPasswordValid = await this.verifyPassword(password, user.password);
                        
                        if (!isPasswordValid) {
                            reject(new Error('Invalid email or password'));
                            return;
                        }
                        
                        // Update last login time
                        user.lastLogin = new Date().toISOString();
                        const updateRequest = userStore.put(user);
                        
                        updateRequest.onsuccess = () => {
                            // Create a safe user object without password
                            const safeUser = { ...user };
                            delete safeUser.password;
                            
                            // Save to session storage
                            this.setCurrentUser(safeUser);
                            
                            resolve(safeUser);
                        };
                        
                        updateRequest.onerror = (event) => {
                            console.error('Error updating last login:', event.target.error);
                            // Still proceed with login even if updating last login fails
                            const safeUser = { ...user };
                            delete safeUser.password;
                            this.setCurrentUser(safeUser);
                            resolve(safeUser);
                        };
                    } catch (error) {
                        console.error('Password verification error:', error);
                        reject(new Error('Authentication error. Please try again.'));
                    }
                };
                
                request.onerror = (event) => {
                    console.error('Login request error:', event.target.error);
                    reject(event.target.error);
                };
                
                transaction.onerror = (event) => {
                    console.error('Login transaction error:', event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('Login error:', error);
                reject(error);
            }
        });
    }
    
    // Update user profile
    async updateUserProfile(email, updatedData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.userStoreName], 'readwrite');
            const userStore = transaction.objectStore(this.userStoreName);
            const request = userStore.get(email);
            
            request.onsuccess = (event) => {
                const user = event.target.result;
                
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }
                
                // Update user data
                const updatedUser = { ...user, ...updatedData };
                
                // Don't allow email change in this simple implementation
                updatedUser.email = user.email;
                
                const updateRequest = userStore.put(updatedUser);
                
                updateRequest.onsuccess = () => {
                    // Update current user in session
                    const safeUser = { ...updatedUser };
                    delete safeUser.password;
                    this.setCurrentUser(safeUser);
                    
                    resolve(safeUser);
                };
                
                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Update user preferences
    async updateUserPreferences(email, preferences) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.userStoreName], 'readwrite');
            const userStore = transaction.objectStore(this.userStoreName);
            const request = userStore.get(email);
            
            request.onsuccess = (event) => {
                const user = event.target.result;
                
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }
                
                // Update preferences
                user.preferences = { ...user.preferences, ...preferences };
                
                const updateRequest = userStore.put(user);
                
                updateRequest.onsuccess = () => {
                    // Update current user in session
                    const safeUser = { ...user };
                    delete safeUser.password;
                    this.setCurrentUser(safeUser);
                    
                    resolve(safeUser);
                };
                
                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Code Snippets Management Methods
    
    // Save code snippet
    async saveCodeSnippet(userId, code, language, title) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.codeSnippetsStoreName], 'readwrite');
            const snippetsStore = transaction.objectStore(this.codeSnippetsStoreName);
            
            const snippet = {
                userId,
                code,
                language,
                title: title || `${language} snippet - ${new Date().toLocaleString()}`,
                dateCreated: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            
            const request = snippetsStore.add(snippet);
            
            request.onsuccess = (event) => {
                // Get the generated ID
                snippet.id = event.target.result;
                resolve(snippet);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Get user's code snippets
    async getUserCodeSnippets(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.codeSnippetsStoreName], 'readonly');
            const snippetsStore = transaction.objectStore(this.codeSnippetsStoreName);
            const userIndex = snippetsStore.index('userId');
            const request = userIndex.getAll(userId);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Update code snippet
    async updateCodeSnippet(snippetId, updatedData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.codeSnippetsStoreName], 'readwrite');
            const snippetsStore = transaction.objectStore(this.codeSnippetsStoreName);
            const request = snippetsStore.get(snippetId);
            
            request.onsuccess = (event) => {
                const snippet = event.target.result;
                
                if (!snippet) {
                    reject(new Error('Snippet not found'));
                    return;
                }
                
                // Update snippet data
                const updatedSnippet = { 
                    ...snippet, 
                    ...updatedData,
                    lastModified: new Date().toISOString()
                };
                
                const updateRequest = snippetsStore.put(updatedSnippet);
                
                updateRequest.onsuccess = () => {
                    resolve(updatedSnippet);
                };
                
                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Delete code snippet
    async deleteCodeSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.codeSnippetsStoreName], 'readwrite');
            const snippetsStore = transaction.objectStore(this.codeSnippetsStoreName);
            const request = snippetsStore.delete(snippetId);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Session Management Methods
    
    // Set current user in session storage
    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Get current user from session storage
    getCurrentUser() {
        const userJson = sessionStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    }
    
    // Logout user
    logout() {
        sessionStorage.removeItem('currentUser');
    }
    
    // Utility Methods
    
    // Simple password hashing (for demo purposes only)
    // In a real application, use a proper hashing library like bcrypt
    async hashPassword(password) {
        // This is a simplified hash for demonstration
        // In production, use a proper hashing library
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Verify password
    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }
}

// Create and export database instance
const userDB = new Database();

// Export for use in other modules
window.userDB = userDB;
