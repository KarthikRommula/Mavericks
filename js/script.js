document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const isHomePage = document.querySelector('.hero') !== null;
    const isCoursesPage = document.querySelector('.course-categories') !== null;
    const isPlaygroundPage = document.querySelector('.playground-section') !== null;
    
    // Check for database initialization status
    if (window.userDB || window.dbInitStatus) {
        console.log('Database module detected, ensuring initialization...');
        
        // Function to wait for database initialization
        async function ensureDatabaseReady() {
            try {
                if (window.dbInitStatus && typeof window.dbInitStatus.waitForInitialization === 'function') {
                    await window.dbInitStatus.waitForInitialization();
                    console.log('Database successfully initialized');
                    
                    // Update UI based on auth state once DB is ready
                    if (window.auth && typeof window.auth.updateUIBasedOnAuthState === 'function') {
                        window.auth.updateUIBasedOnAuthState();
                    }
                }
            } catch (error) {
                console.error('Database initialization failed:', error);
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Database initialization failed. Some features may not work properly.', 'error');
                }
            }
        }
        
        // Start the initialization check
        ensureDatabaseReady();
    }
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
                // Simulate successful subscription
                emailInput.value = '';
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success-message';
                successMessage.textContent = 'Thank you for subscribing!';
                
                // Remove existing messages
                const existingSuccess = this.querySelector('.form-success-message');
                if (existingSuccess) existingSuccess.remove();
                
                this.appendChild(successMessage);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 3000);
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error-message';
                errorMessage.textContent = 'Please enter a valid email address.';
                
                // Remove existing error
                const existingError = this.querySelector('.form-error-message');
                if (existingError) existingError.remove();
                
                this.appendChild(errorMessage);
            }
        });
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
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
    
    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window && featureCards.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Stop observing once animation is triggered
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
    
    // Feature link hover effects
    const featureLinks = document.querySelectorAll('.feature-link');
    if (featureLinks.length > 0) {
        featureLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.add('bounce');
                    setTimeout(() => {
                        icon.classList.remove('bounce');
                    }, 1000);
                }
            });
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
                    <div class="playground-modal-header">
                        <h3>Code Playground Preview</h3>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="playground-modal-body">
                        <div class="playground-editor">
                            <div class="editor-header">
                                <span>JavaScript</span>
                                <div class="editor-actions">
                                    <button class="ai-assist-btn" title="AI Assistance"><i class="fas fa-robot"></i></button>
                                    <button class="voice-explain-btn" title="Voice Explanation"><i class="fas fa-microphone-alt"></i></button>
                                    <button class="clear-output-btn" title="Clear Output"><i class="fas fa-trash"></i></button>
                                </span>
                                <button class="run-code-btn">Run Code</button>
                            </div>
                            <textarea class="code-editor">// Write your code here
console.log("Hello, TechLearn!");</textarea>
                        </div>
                        <div class="playground-output">
                            <div class="output-header">
                                <span>Output</span>
                            </div>
                            <div class="output-console">
                                <div class="console-message">// Output will appear here</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(playgroundModal);
            
            // Add event listeners
            const closeBtn = playgroundModal.querySelector('.close-modal');
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
                outputConsole.innerHTML = ''; // Clear previous output
                
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
