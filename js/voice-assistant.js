// Voice Assistant Module for TechLearn Code Playground
// Provides voice explanations for code errors and concepts with Gemini AI integration

document.addEventListener('DOMContentLoaded', function() {
    // Check browser compatibility for voice features
    const isSpeechSynthesisSupported = 'speechSynthesis' in window;
    const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    // Log compatibility status
    console.log('Speech Synthesis supported:', isSpeechSynthesisSupported);
    console.log('Speech Recognition supported:', isSpeechRecognitionSupported);
    
    // Initialize voice synthesis if supported
    let synth = null;
    let voices = [];
    let preferredVoice = null;
    
    if (isSpeechSynthesisSupported) {
        synth = window.speechSynthesis;
        
        // Get available voices and select a high-quality one
        function loadVoices() {
            voices = synth.getVoices();
            
            // Try to find a good English voice
            if (voices.length > 0) {
                // First, try to find a Google or Microsoft voice
                preferredVoice = voices.find(voice => 
                    voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                );
                
                // If no Google/Microsoft voice, try any English voice
                if (!preferredVoice) {
                    preferredVoice = voices.find(voice => voice.lang.includes('en'));
                }
                
                // If still no voice, use the first available
                if (!preferredVoice && voices.length > 0) {
                    preferredVoice = voices[0];
                }
                
                console.log('Selected voice:', preferredVoice ? preferredVoice.name : 'None available');
            }
        }
        
        // Load voices when available
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
        loadVoices();
    } else {
        console.warn('Speech synthesis not supported in this browser');
        // Show notification to user
        if (window.auth && window.auth.showNotification) {
            setTimeout(() => {
                window.auth.showNotification('Voice features are not supported in your browser. Some functionality may be limited.', 'info');
            }, 2000);
        }
    }
    
    // Initialize voice recognition if supported
    let recognition = null;
    if (isSpeechRecognitionSupported) {
        // Use the appropriate constructor based on browser support
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            recognition = new SpeechRecognition();
        }
        
        if (recognition) {
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
        }
    }
    
    // Voice input button
    const voiceInputBtn = document.getElementById('voice-input');
    
    if (voiceInputBtn) {
        // Update button appearance based on feature availability
        if (!isSpeechRecognitionSupported) {
            voiceInputBtn.classList.add('disabled');
            voiceInputBtn.setAttribute('title', 'Voice input not supported in your browser');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
        
        voiceInputBtn.addEventListener('click', function() {
            // If speech recognition is not supported, show a message
            if (!isSpeechRecognitionSupported) {
                const aiMessages = document.getElementById('ai-messages');
                if (aiMessages) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'ai-message';
                    errorMessage.innerHTML = `
                        <div class="ai-avatar"><i class="fas fa-robot"></i></div>
                        <div class="message-content">
                            <p>Voice input is not supported in your browser. Please type your question instead.</p>
                        </div>
                    `;
                    aiMessages.appendChild(errorMessage);
                    aiMessages.scrollTop = aiMessages.scrollHeight;
                }
                
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Voice input is not supported in your browser', 'error');
                }
                return;
            }
            
            // If already recording, stop
            if (this.classList.contains('recording')) {
                recognition.stop();
                this.innerHTML = '<i class="fas fa-microphone"></i>';
                this.classList.remove('recording');
                return;
            }
            
            // Start recording
            this.innerHTML = '<i class="fas fa-microphone-alt"></i>';
            this.classList.add('recording');
            
            recognition.start();
            
            // Handle speech recognition results
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                document.getElementById('ai-prompt').value = transcript;
                document.getElementById('ai-submit').click();
            };
            
            // Handle errors
            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceInputBtn.classList.remove('recording');
                
                // Show error message
                const aiMessages = document.getElementById('ai-messages');
                if (aiMessages) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'ai-message';
                    errorMessage.innerHTML = `
                        <div class="ai-avatar"><i class="fas fa-robot"></i></div>
                        <div class="message-content">
                            <p>Sorry, I couldn't understand that. Please try again or type your question.</p>
                        </div>
                    `;
                    aiMessages.appendChild(errorMessage);
                    aiMessages.scrollTop = aiMessages.scrollHeight;
                }
                
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Voice recognition error: ' + event.error, 'error');
                }
            };
            
            // Reset button when done
            recognition.onend = function() {
                voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceInputBtn.classList.remove('recording');
            };
        });
    }
    
    // Explain error with voice using Gemini AI when available
    window.explainErrorWithVoice = async function(errorMessage, code = null) {
        // Check if speech synthesis is supported
        if (!isSpeechSynthesisSupported || !synth) {
            console.warn('Speech synthesis not available for error explanation');
            if (window.auth && window.auth.showNotification) {
                window.auth.showNotification('Voice explanation not available in your browser', 'info');
            }
            return;
        }
        
        // Stop any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Show speaking indicator
        const aiMessages = document.getElementById('ai-messages');
        if (aiMessages) {
            const speakingIndicator = document.createElement('div');
            speakingIndicator.id = 'voice-explanation-indicator';
            speakingIndicator.className = 'voice-explanation-indicator';
            speakingIndicator.innerHTML = `
                <div class="ai-avatar"><i class="fas fa-volume-up"></i></div>
                <div class="message-content">
                    <p>Preparing voice explanation...</p>
                </div>
            `;
            aiMessages.appendChild(speakingIndicator);
            aiMessages.scrollTop = aiMessages.scrollHeight;
        }
        
        // Get error type and message
        let errorType = 'error';
        if (errorMessage.includes(':')) {
            errorType = errorMessage.split(':')[0].trim();
        }
        
        // Get detailed explanation
        let explanation = '';
        
        // Try to get AI-powered explanation if code is available
        if (code && window.errorDetection && window.errorDetection.analyzeCodeWithAI) {
            try {
                // Get the current language from the language selector
                const languageSelect = document.getElementById('language-select');
                const language = languageSelect ? languageSelect.value : 'javascript';
                
                // Update indicator
                if (speakingIndicator) {
                    speakingIndicator.querySelector('p').textContent = 'Getting AI analysis of your error...';
                }
                
                // Get AI analysis
                const aiAnalysis = await window.errorDetection.analyzeCodeWithAI(code, language, errorMessage);
                
                if (aiAnalysis && aiAnalysis.success) {
                    explanation = aiAnalysis.analysis;
                }
            } catch (error) {
                console.error('Error getting AI explanation:', error);
                // Fall back to standard explanations
            }
        }
        
        // If AI explanation failed or wasn't available, use built-in explanations
        if (!explanation) {
            // For JavaScript errors
            if (window.errorDetection && window.errorDetection.getErrorExplanation) {
                const error = new Error(errorMessage);
                error.name = errorType;
                explanation = window.errorDetection.getErrorExplanation(error);
            } else {
                // Generic explanations based on error type
                explanation = getGenericErrorExplanation(errorType, errorMessage);
            }
        }
        
        // Create speech text
        const speechText = `You have a ${errorType}. ${explanation} The specific error message is: ${errorMessage}`;
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(speechText);
        
        // Select a voice
        if (voices.length > 0) {
            // Prefer a female voice if available
            const femaleVoice = voices.find(voice => 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Google UK English Female')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            } else {
                // Otherwise use the first available voice
                utterance.voice = voices[0];
            }
        }
        
        // Set properties
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Show speaking indicator
        const outputConsole = document.getElementById('output-console');
        const speakingIndicator = document.createElement('div');
        speakingIndicator.className = 'speaking-indicator';
        speakingIndicator.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
        outputConsole.appendChild(speakingIndicator);
        
        // Speak
        synth.speak(utterance);
        
        // Remove indicator when done
        utterance.onend = function() {
            if (outputConsole.contains(speakingIndicator)) {
                outputConsole.removeChild(speakingIndicator);
            }
        };
    };
    
    // Provide voice explanation for code concepts
    window.explainConceptWithVoice = function(concept) {
        // Stop any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Get explanation for concept
        const explanation = getConceptExplanation(concept);
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(explanation);
        
        // Select a voice
        if (voices.length > 0) {
            // Prefer a female voice if available
            const femaleVoice = voices.find(voice => 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Google UK English Female')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            } else {
                // Otherwise use the first available voice
                utterance.voice = voices[0];
            }
        }
        
        // Set properties
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Show speaking indicator
        const aiMessages = document.getElementById('ai-messages');
        if (aiMessages) {
            const speakingMessage = document.createElement('div');
            speakingMessage.className = 'ai-message';
            speakingMessage.innerHTML = `
                <div class="ai-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p><i class="fas fa-volume-up"></i> Explaining: ${concept}...</p>
                </div>
            `;
            aiMessages.appendChild(speakingMessage);
            aiMessages.scrollTop = aiMessages.scrollHeight;
            
            // Remove indicator when done
            utterance.onend = function() {
                speakingMessage.querySelector('.message-content p').innerHTML = 
                    `<p>Explanation of "${concept}" complete.</p>`;
            };
        }
        
        // Speak
        synth.speak(utterance);
    };
    
    // Get generic error explanation
    function getGenericErrorExplanation(errorType, errorMessage) {
        // Common error types and explanations
        const explanations = {
            'SyntaxError': 'There is a problem with the syntax of your code. This often happens when you have mismatched brackets, missing semicolons, or other syntax issues.',
            'ReferenceError': 'You are trying to use a variable or function that doesn\'t exist or is out of scope.',
            'TypeError': 'You are trying to perform an operation on a value of the wrong type, like calling a non-function or accessing properties of null.',
            'RangeError': 'A numeric value is outside the range of allowed values, such as an invalid array length or invalid date.',
            'IndentationError': 'In Python, indentation is used to define code blocks. Make sure your indentation is consistent throughout your code.',
            'NameError': 'You are trying to use a variable or function that hasn\'t been defined.',
            'ImportError': 'There was a problem importing a module. Make sure the module exists and is installed.',
            'ValueError': 'You provided an invalid value to a function, such as passing a string when a number is expected.',
            'IndexError': 'You are trying to access an index that is out of range for a list or array.',
            'KeyError': 'You are trying to access a dictionary key that doesn\'t exist.',
            'AttributeError': 'You are trying to access an attribute or method that doesn\'t exist on an object.',
            'ZeroDivisionError': 'You are trying to divide by zero, which is not allowed in mathematics.',
            'FileNotFoundError': 'The file you are trying to open doesn\'t exist or the path is incorrect.',
            'PermissionError': 'You don\'t have permission to access a file or resource.',
            'RuntimeError': 'An error occurred during program execution that doesn\'t fall into any other category.',
            'MemoryError': 'Your program has run out of memory.',
            'RecursionError': 'Maximum recursion depth exceeded. This happens when a function calls itself too many times.',
            'NotImplementedError': 'The method or function you are trying to use is not implemented yet.',
            'AssertionError': 'An assertion statement has failed, indicating a programming error.',
            'EOFError': 'End of file reached unexpectedly, often when reading input.',
            'FloatingPointError': 'An error occurred during a floating-point calculation.',
            'GeneratorExit': 'A generator\'s close() method was called.',
            'IOError': 'An input/output operation failed, such as a file operation.',
            'ModuleNotFoundError': 'The module you are trying to import doesn\'t exist or is not installed.',
            'OSError': 'An operating system error occurred, such as a file operation failure.',
            'StopIteration': 'An iterator has no more items.',
            'SystemError': 'An internal error in the Python interpreter.',
            'SystemExit': 'The sys.exit() function was called.',
            'UnboundLocalError': 'You are trying to use a local variable before it has been assigned.',
            'UnicodeError': 'An error related to Unicode encoding or decoding.',
            'UnicodeEncodeError': 'An error encoding Unicode characters.',
            'UnicodeDecodeError': 'An error decoding Unicode characters.',
            'UnicodeTranslateError': 'An error during Unicode translation.',
            'Warning': 'A warning message, not an error.',
            'DeprecationWarning': 'A feature is deprecated and may be removed in future versions.',
            'FutureWarning': 'A feature will change in a future version.',
            'UserWarning': 'A user-defined warning.',
            'SyntaxWarning': 'A possible syntax problem, but not a syntax error.',
            'RuntimeWarning': 'A possible runtime problem, but not a runtime error.',
            'ImportWarning': 'A possible problem with an import.',
            'UnicodeWarning': 'A possible problem with Unicode.',
            'BytesWarning': 'A possible problem with bytes or bytearray objects.',
            'ResourceWarning': 'A possible problem with resource usage.'
        };
        
        // Return specific explanation if available
        if (explanations[errorType]) {
            return explanations[errorType];
        }
        
        // Default explanation
        return 'There is an error in your code. Check the syntax and logic carefully.';
    }
    
    // Get explanation for programming concepts
    function getConceptExplanation(concept) {
        // Common programming concepts and explanations
        const conceptExplanations = {
            'variable': 'A variable is a named storage location in a program that holds a value. Variables can be assigned values and referenced later in the code.',
            'function': 'A function is a reusable block of code that performs a specific task. Functions help organize code, reduce repetition, and make programs more modular.',
            'loop': 'A loop is a control structure that repeats a block of code multiple times. Common types include for loops, while loops, and do-while loops.',
            'conditional': 'Conditionals, like if-else statements, allow code to make decisions based on conditions. They execute different code blocks depending on whether conditions are true or false.',
            'array': 'An array is a data structure that stores a collection of elements, typically of the same type, in a contiguous memory location. Elements can be accessed by their index.',
            'object': 'An object is a data structure that groups related data and functions together. Objects have properties (data) and methods (functions) that operate on that data.',
            'class': 'A class is a blueprint for creating objects. It defines the properties and methods that objects of that class will have.',
            'inheritance': 'Inheritance is a mechanism in object-oriented programming where a class inherits properties and methods from another class. It promotes code reuse and establishes a hierarchy.',
            'recursion': 'Recursion is when a function calls itself to solve a problem. It breaks down complex problems into simpler instances of the same problem.',
            'algorithm': 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. Good algorithms are efficient, clear, and produce correct results.',
            'data structure': 'A data structure is a way of organizing and storing data to perform operations efficiently. Common examples include arrays, linked lists, stacks, queues, trees, and graphs.',
            'API': 'API stands for Application Programming Interface. It defines how different software components should interact with each other, allowing applications to communicate.',
            'debugging': 'Debugging is the process of finding and fixing errors or bugs in code. It involves identifying the problem, locating the source, and making corrections.',
            'framework': 'A framework is a pre-built structure that provides a foundation for developing software applications. It includes reusable code and tools to streamline development.',
            'library': 'A library is a collection of pre-written code that developers can use to perform common tasks without writing the code from scratch.',
            'compiler': 'A compiler translates high-level programming code into machine code that computers can execute directly.',
            'interpreter': 'An interpreter executes code line by line, translating each line into machine code at runtime, rather than compiling the entire program beforehand.',
            'syntax': 'Syntax refers to the rules that define how programs written in a programming language must be structured to be valid.',
            'semantics': 'Semantics refers to the meaning of programming constructs. While syntax is about form, semantics is about function and what code actually does.',
            'variable scope': 'Variable scope defines where in a program a variable can be accessed. Common scopes include global (accessible everywhere) and local (accessible only within a specific block).',
            'closure': 'A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has finished executing.',
            'callback': 'A callback is a function passed as an argument to another function, to be executed later or when a certain event occurs.',
            'promise': 'A promise is an object representing the eventual completion or failure of an asynchronous operation and its resulting value.',
            'async/await': 'Async/await is a syntax for handling asynchronous operations in a more synchronous-looking way, making asynchronous code easier to write and understand.',
            'event loop': 'The event loop is a programming construct that waits for and dispatches events or messages in a program. It\'s fundamental to non-blocking I/O operations.',
            'garbage collection': 'Garbage collection is automatic memory management that frees memory occupied by objects that are no longer in use by the program.',
            'exception handling': 'Exception handling is a mechanism for handling runtime errors gracefully, using constructs like try-catch blocks to prevent program crashes.',
            'polymorphism': 'Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling the same interface to be used for different underlying forms.',
            'encapsulation': 'Encapsulation is the bundling of data and methods that operate on that data within a single unit (like a class), often with restricted access to internal state.',
            'abstraction': 'Abstraction is the concept of hiding complex implementation details and showing only the necessary features of an object, reducing complexity and increasing efficiency.',
            'interface': 'An interface defines a contract of methods that a class must implement, without specifying how they should be implemented.',
            'dependency injection': 'Dependency injection is a technique where an object receives other objects it depends on, rather than creating them internally.',
            'design pattern': 'A design pattern is a reusable solution to a commonly occurring problem in software design. Examples include Singleton, Factory, and Observer patterns.',
            'REST API': 'REST (Representational State Transfer) is an architectural style for designing networked applications, typically using HTTP methods like GET, POST, PUT, and DELETE.',
            'database': 'A database is an organized collection of data stored and accessed electronically. Common types include relational databases (like MySQL) and NoSQL databases (like MongoDB).',
            'SQL': 'SQL (Structured Query Language) is a domain-specific language used for managing and manipulating relational databases.',
            'version control': 'Version control is a system that records changes to files over time, allowing you to recall specific versions later. Git is a popular version control system.',
            'agile': 'Agile is a project management approach that emphasizes flexibility, customer satisfaction, and team collaboration, with iterative development and continuous feedback.',
            'CI/CD': 'CI/CD (Continuous Integration/Continuous Deployment) is a method to frequently deliver apps by introducing automation into the development stages.',
            'unit testing': 'Unit testing is a software testing method where individual units or components of software are tested in isolation from the rest of the code.',
            'integration testing': 'Integration testing is a type of testing where software modules are combined and tested as a group to verify they work together correctly.',
            'refactoring': 'Refactoring is the process of restructuring existing code without changing its external behavior, to improve readability, reduce complexity, or enhance performance.'
        };
        
        // Normalize concept (lowercase, remove "the", etc.)
        const normalizedConcept = concept.toLowerCase()
            .replace(/^(the|a|an) /, '')
            .replace(/[^\w\s]/g, '')
            .trim();
        
        // Return specific explanation if available
        if (conceptExplanations[normalizedConcept]) {
            return conceptExplanations[normalizedConcept];
        }
        
        // Check for partial matches
        for (const key in conceptExplanations) {
            if (normalizedConcept.includes(key) || key.includes(normalizedConcept)) {
                return conceptExplanations[key];
            }
        }
        
        // Default explanation
        return `${concept} is a programming concept. I don't have a specific explanation for it at the moment, but you can ask for more details in the AI assistant chat.`;
    }
    
    // Add function to read text aloud
    window.readTextAloud = function(text) {
        // Stop any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice to preferred voice
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        // Set other properties for better speech
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Full volume
        
        // Speak the text
        synth.speak(utterance);
        
        return {
            cancel: function() {
                synth.cancel();
            },
            pause: function() {
                synth.pause();
            },
            resume: function() {
                synth.resume();
            },
            isSpeaking: function() {
                return synth.speaking;
            }
        };
    };
    
    // Export functions for use in other modules
    window.voiceAssistant = {
        explainErrorWithVoice,
        explainConceptWithVoice,
        getGenericErrorExplanation,
        getConceptExplanation,
        readTextAloud
    };
});
