document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-menu') && !event.target.closest('.menu-toggle') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
    
    // Testimonials Slider
    let currentTestimonial = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const totalTestimonials = testimonialCards.length;
    
    // Initialize testimonials
    if (testimonialCards.length > 0) {
        showTestimonial(currentTestimonial);
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(currentTestimonial);
        }, 5000);
        
        // Create navigation dots for testimonials
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        if (testimonialsSlider) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'testimonial-dots';
            
            for (let i = 0; i < totalTestimonials; i++) {
                const dot = document.createElement('span');
                dot.className = 'testimonial-dot';
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', function() {
                    currentTestimonial = parseInt(this.getAttribute('data-index'));
                    showTestimonial(currentTestimonial);
                });
                dotsContainer.appendChild(dot);
            }
            
            testimonialsSlider.appendChild(dotsContainer);
        }
    }
    
    function showTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none';
        });
        
        // Update dots
        const dots = document.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for fixed header
                    behavior: 'smooth'
                });
                
                // Close mobile menu after clicking a link
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
    
    // Form submission handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success-message';
                successMessage.textContent = 'Thank you for subscribing!';
                
                this.innerHTML = '';
                this.appendChild(successMessage);
                
                // In a real scenario, you would send this to your backend
                console.log('Newsletter subscription for:', email);
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error-message';
                errorMessage.textContent = 'Please enter a valid email address.';
                
                // Remove any existing error message
                const existingError = this.querySelector('.form-error-message');
                if (existingError) existingError.remove();
                
                this.appendChild(errorMessage);
            }
        });
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Add sticky header when scrolling
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        });
    }
    
    // Course card hover effects
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
    
    // Feature card animations
    const featureCards = document.querySelectorAll('.feature-card');
    
    // Simple animation when feature cards come into view
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        featureCards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        featureCards.forEach(card => {
            card.classList.add('animated');
        });
    }
    
    // Login modal functionality
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createAndShowModal('login');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createAndShowModal('signup');
        });
    }
    
    function createAndShowModal(type) {
        // Remove any existing modal
        const existingModal = document.querySelector('.auth-modal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'auth-modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'auth-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
        
        const form = document.createElement('form');
        form.className = 'auth-form';
        
        const title = document.createElement('h2');
        title.textContent = type === 'login' ? 'Login to Your Account' : 'Create an Account';
        
        form.appendChild(title);
        
        // Add form elements based on type
        if (type === 'login') {
            form.innerHTML += `
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <a href="#" class="forgot-password">Forgot password?</a>
                </div>
                <button type="submit" class="btn-primary btn-block">Login</button>
                <p class="auth-switch">Don't have an account? <a href="#" class="switch-to-signup">Sign Up</a></p>
            `;
        } else {
            form.innerHTML += `
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" required>
                </div>
                <button type="submit" class="btn-primary btn-block">Sign Up</button>
                <p class="auth-switch">Already have an account? <a href="#" class="switch-to-login">Login</a></p>
            `;
        }
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            console.log('Form submitted:', type);
            
            // Display success message
            form.innerHTML = `
                <div class="auth-success">
                    <i class="fas fa-check-circle"></i>
                    <h3>${type === 'login' ? 'Login Successful!' : 'Account Created!'}</h3>
                    <p>${type === 'login' ? 'You will be redirected to your dashboard.' : 'Welcome to TechLearn!'}</p>
                </div>
            `;
            
            // In a real scenario, you would handle authentication with a backend
            setTimeout(() => {
                modal.remove();
            }, 2000);
        });
        
        // Add switch functionality
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners for switching between login and signup
        const switchToSignup = modal.querySelector('.switch-to-signup');
        if (switchToSignup) {
            switchToSignup.addEventListener('click', function(e) {
                e.preventDefault();
                modal.remove();
                createAndShowModal('signup');
            });
        }
        
        const switchToLogin = modal.querySelector('.switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                modal.remove();
                createAndShowModal('login');
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Code Playground preview functionality
    const codePlaygroundBtn = document.querySelector('.code-playground-preview .btn-primary');
    if (codePlaygroundBtn) {
        codePlaygroundBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create and show a simple code playground preview
            const playgroundModal = document.createElement('div');
            playgroundModal.className = 'playground-modal';
            
            playgroundModal.innerHTML = `
                <div class="playground-modal-content">
                    <span class="playground-modal-close">&times;</span>
                    <h2>Interactive Code Playground</h2>
                    <div class="playground-interface">
                        <div class="playground-editor">
                            <div class="editor-header">
                                <span class="language-selector">
                                    <select>
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="c++">C++</option>
                                    </select>
                                </span>
                                <button class="run-code-btn">Run Code</button>
                            </div>
                            <textarea class="code-editor">// Write your code here
console.log("Hello, TechLearn!");</textarea>
                        </div>
                        <div class="playground-output">
                            <div class="output-header">
                                <span>Output</span>
                                <button class="clear-output-btn">Clear</button>
                            </div>
                            <div class="output-console">
                                <div class="console-message">// Output will appear here</div>
                            </div>
                        </div>
                    </div>
                    <div class="playground-footer">
                        <button class="ai-assist-btn"><i class="fas fa-robot"></i> AI Assist</button>
                        <button class="voice-explain-btn"><i class="fas fa-microphone-alt"></i> Voice Explain</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(playgroundModal);
            
            // Add functionality to the playground
            const closeBtn = playgroundModal.querySelector('.playground-modal-close');
            const runCodeBtn = playgroundModal.querySelector('.run-code-btn');
            const codeEditor = playgroundModal.querySelector('.code-editor');
            const outputConsole = playgroundModal.querySelector('.output-console');
            const clearOutputBtn = playgroundModal.querySelector('.clear-output-btn');
            const aiAssistBtn = playgroundModal.querySelector('.ai-assist-btn');
            const voiceExplainBtn = playgroundModal.querySelector('.voice-explain-btn');
            
            closeBtn.addEventListener('click', function() {
                playgroundModal.remove();
            });
            
            runCodeBtn.addEventListener('click', function() {
                const code = codeEditor.value;
                outputConsole.innerHTML = '';
                
                // For demo purposes, we're just showing the code
                // In a real implementation, you'd use a secure evaluation method
                try {
                    // Create a safe way to capture console.log output
                    const originalLog = console.log;
                    const logs = [];
                    
                    console.log = function() {
                        logs.push(Array.from(arguments).join(' '));
                        originalLog.apply(console, arguments);
                    };
                    
                    // For demo purposes only - NOT SAFE for production
                    // This is just to show functionality
                    try {
                        const result = new Function(code)();
                        
                        logs.forEach(log => {
                            const logElement = document.createElement('div');
                            logElement.className = 'console-message';
                            logElement.textContent = log;
                            outputConsole.appendChild(logElement);
                        });
                        
                        if (result !== undefined) {
                            const resultElement = document.createElement('div');
                            resultElement.className = 'console-message result';
                            resultElement.textContent = '→ ' + result;
                            outputConsole.appendChild(resultElement);
                        }
                    } catch (error) {
                        const errorElement = document.createElement('div');
                        errorElement.className = 'console-message error';
                        errorElement.textContent = error.toString();
                        outputConsole.appendChild(errorElement);
                    }
                    
                    // Restore original console.log
                    console.log = originalLog;
                } catch (e) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'console-message error';
                    errorElement.textContent = 'Error: ' + e.message;
                    outputConsole.appendChild(errorElement);
                }
            });
            
            clearOutputBtn.addEventListener('click', function() {
                outputConsole.innerHTML = '<div class="console-message">// Output will appear here</div>';
            });
            
            aiAssistBtn.addEventListener('click', function() {
                const code = codeEditor.value;
                
                // Simulate AI assistance
                const suggestions = [
                    'Consider using const instead of var for better variable scoping.',
                    'You might want to add error handling with try/catch blocks.',
                    'This code could be optimized by using array methods like map() or filter().',
                    'Adding comments would improve readability.'
                ];
                
                const aiResponse = document.createElement('div');
                aiResponse.className = 'ai-suggestion';
                aiResponse.innerHTML = `
                    <div class="ai-header">
                        <i class="fas fa-robot"></i> AI Suggestions
                    </div>
                    <ul>
                        ${suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                `;
                
                outputConsole.appendChild(aiResponse);
            });
            
            voiceExplainBtn.addEventListener('click', function() {
                const voiceMessage = document.createElement('div');
                voiceMessage.className = 'voice-message';
                voiceMessage.innerHTML = `
                    <i class="fas fa-microphone-alt"></i>
                    <span>Voice explanation feature activated. In a real implementation, this would provide audio explanations of your code.</span>
                `;
                
                outputConsole.appendChild(voiceMessage);
            });
            
            // Close modal when clicking outside
            playgroundModal.addEventListener('click', function(e) {
                if (e.target === playgroundModal) {
                    playgroundModal.remove();
                }
            });
        });
    }
});