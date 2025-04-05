// AI Integration Module for TechLearn Code Playground
// Provides enhanced AI assistance for code analysis and learning

document.addEventListener('DOMContentLoaded', function() {
    // Gemini AI API configuration
    const GEMINI_API_KEY = 'AIzaSyAxiEmDZGBu9IwEcSOMqY-lRtuvgpHRi8U';
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    // AI UI elements
    const aiPromptInput = document.getElementById('ai-prompt');
    const aiSubmitBtn = document.getElementById('ai-submit');
    const aiMessagesContainer = document.getElementById('ai-messages');
    
    // Initialize AI with welcome message
    if (aiMessagesContainer) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'ai-message';
        welcomeMessage.innerHTML = `
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>👋 Welcome to the TechLearn AI Assistant! I'm here to help you with your code. You can:</p>
                <ul>
                    <li>Ask me to explain concepts</li>
                    <li>Get help with debugging errors</li>
                    <li>Request code optimization suggestions</li>
                    <li>Learn best practices</li>
                </ul>
                <p>Try asking a question or click the microphone to use voice input.</p>
            </div>
        `;
        aiMessagesContainer.appendChild(welcomeMessage);
        
        // Check if speech synthesis is available
        if ('speechSynthesis' in window) {
            // Speak welcome message
            const welcomeVoiceMessage = new SpeechSynthesisUtterance(
                "Welcome to the TechLearn AI Assistant! I'm here to help you with your code."
            );
            speechSynthesis.speak(welcomeVoiceMessage);
        }
    }
    
    // Submit prompt to AI
    if (aiSubmitBtn) {
        aiSubmitBtn.addEventListener('click', function() {
            const prompt = aiPromptInput.value.trim();
            if (!prompt) return;
            
            // Add user message to the chat
            addUserMessage(prompt);
            
            // Clear input
            aiPromptInput.value = '';
            
            // Get current code context
            let codeContext = '';
            if (window.playgroundCore && window.playgroundCore.codeEditor) {
                codeContext = window.playgroundCore.codeEditor.getValue();
            } else {
                const codeEditor = document.querySelector('.CodeMirror');
                if (codeEditor && codeEditor.CodeMirror) {
                    codeContext = codeEditor.CodeMirror.getValue();
                }
            }
            
            // Show thinking indicator
            const thinkingIndicator = document.createElement('div');
            thinkingIndicator.className = 'ai-thinking';
            thinkingIndicator.innerHTML = `
                <div class="ai-avatar"><i class="fas fa-robot"></i></div>
                <div class="thinking-content">
                    <div class="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            aiMessagesContainer.appendChild(thinkingIndicator);
            aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
            
            // Call Gemini API with enhanced prompt
            callGeminiAPI(prompt, codeContext)
                .then(response => {
                    // Remove thinking indicator
                    aiMessagesContainer.removeChild(thinkingIndicator);
                    
                    // Add AI response
                    addAIMessage(response);
                    
                    // Add voice explanation button if relevant
                    if (isConceptExplanation(prompt)) {
                        addVoiceExplanationButton(prompt);
                    }
                })
                .catch(error => {
                    // Remove thinking indicator
                    aiMessagesContainer.removeChild(thinkingIndicator);
                    
                    // Add error message
                    addAIMessage("I'm sorry, I encountered an error processing your request. Please try again.");
                    console.error('Gemini API Error:', error);
                });
        });
    }
    
    // Handle Enter key in prompt input
    if (aiPromptInput) {
        aiPromptInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                aiSubmitBtn.click();
            }
        });
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'user-message';
        userMessageElement.innerHTML = `
            <div class="user-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${escapeHTML(message)}</p>
            </div>
        `;
        aiMessagesContainer.appendChild(userMessageElement);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
    }
    
    // Add AI message to chat
    function addAIMessage(message) {
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'ai-message';
        aiMessageElement.innerHTML = `
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${formatAIResponse(message)}</p>
            </div>
        `;
        aiMessagesContainer.appendChild(aiMessageElement);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
    }
    
    // Add voice explanation button
    function addVoiceExplanationButton(concept) {
        // Only add the button if speech synthesis is available
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'voice-explanation-container';
        buttonContainer.innerHTML = `
            <button class="voice-explain-concept-btn" data-concept="${escapeHTML(concept)}">
                <i class="fas fa-volume-up"></i> Explain "${concept.length > 20 ? concept.substring(0, 20) + '...' : concept}" with voice
            </button>
        `;
        aiMessagesContainer.appendChild(buttonContainer);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
        
        // Add event listener
        const voiceButton = buttonContainer.querySelector('.voice-explain-concept-btn');
        voiceButton.addEventListener('click', function() {
            const conceptToExplain = this.getAttribute('data-concept');
            
            // Find the last AI message content
            const lastAIMessage = aiMessagesContainer.querySelector('.ai-message:last-child .message-content');
            if (!lastAIMessage) {
                console.error('No AI message found to speak');
                return;
            }
            
            // Get the text content from the last AI message
            const explanationText = lastAIMessage.textContent.trim();
            
            // Create a new utterance
            const utterance = new SpeechSynthesisUtterance(explanationText);
            
            // Set properties
            utterance.rate = 1.0; // Speed
            utterance.pitch = 1.0; // Pitch
            utterance.volume = 1.0; // Volume
            
            // Optional: Get available voices and set a better one if available
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Try to find a good English voice
                const englishVoice = voices.find(voice => 
                    voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                );
                if (englishVoice) utterance.voice = englishVoice;
            }
            
            // Change button appearance while speaking
            voiceButton.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
            voiceButton.disabled = true;
            
            // Reset button when done speaking
            utterance.onend = function() {
                voiceButton.innerHTML = `<i class="fas fa-volume-up"></i> Explain "${concept.length > 20 ? concept.substring(0, 20) + '...' : concept}" with voice`;
                voiceButton.disabled = false;
            };
            
            // Handle errors
            utterance.onerror = function(event) {
                console.error('Speech synthesis error:', event);
                voiceButton.innerHTML = `<i class="fas fa-volume-up"></i> Explain "${concept.length > 20 ? concept.substring(0, 20) + '...' : concept}" with voice`;
                voiceButton.disabled = false;
            };
            
            // Speak the text
            speechSynthesis.speak(utterance);
        });
    }
    
    // Format AI response (convert markdown-like syntax to HTML)
    function formatAIResponse(response) {
        // Escape HTML first
        let formatted = escapeHTML(response);
        
        // Convert code blocks
        formatted = formatted.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Convert inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert bold text
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    // Escape HTML to prevent XSS
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Check if prompt is asking for concept explanation
    function isConceptExplanation(prompt) {
        const explanationPatterns = [
            /what is/i,
            /explain/i,
            /how does/i,
            /tell me about/i,
            /define/i,
            /meaning of/i,
            /concept of/i,
            /understand/i
        ];
        
        return explanationPatterns.some(pattern => prompt.match(pattern));
    }
    
    // Call Gemini API with enhanced prompt
    async function callGeminiAPI(prompt, codeContext) {
        try {
            // Enhance prompt with code context and specific instructions
            let enhancedPrompt = `I'm working with the following code:\n\n${codeContext}\n\n`;
            
            // Detect prompt type and customize instructions
            if (prompt.toLowerCase().includes('error') || prompt.toLowerCase().includes('bug') || prompt.toLowerCase().includes('fix')) {
                enhancedPrompt += `User is asking about an error or bug: ${prompt}\n\n`;
                enhancedPrompt += `Please analyze the code for potential issues. If you identify errors, explain:
1. What the error is
2. Why it's happening in simple terms
3. How to fix it with a code example
4. Best practices to avoid similar issues in the future`;
            } else if (isConceptExplanation(prompt)) {
                enhancedPrompt += `User wants an explanation: ${prompt}\n\n`;
                enhancedPrompt += `Please provide a clear, educational explanation that:
1. Defines the concept in simple terms
2. Explains how it relates to the code context
3. Provides a simple example if relevant
4. Mentions any best practices or common pitfalls`;
            } else if (prompt.toLowerCase().includes('optimize') || prompt.toLowerCase().includes('improve') || prompt.toLowerCase().includes('better')) {
                enhancedPrompt += `User wants optimization suggestions: ${prompt}\n\n`;
                enhancedPrompt += `Please analyze the code and suggest improvements for:
1. Performance optimization
2. Code readability
3. Best practices
4. Modern syntax or approaches
Provide specific code examples for each suggestion.`;
            } else {
                enhancedPrompt += `User question: ${prompt}\n\n`;
                enhancedPrompt += `Please provide a helpful, educational response. If there are code issues, explain them clearly. If the user is asking for an explanation, make it beginner-friendly but technically accurate.`;
            }
            
            // Call API with correct URL format
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API error response:', errorData);
                throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                throw new Error(`Gemini API error: ${data.error.message}`);
            } else {
                console.error('Unexpected API response format:', data);
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
    
    // Export functions for use in other modules
    window.aiIntegration = {
        addUserMessage,
        addAIMessage,
        formatAIResponse,
        callGeminiAPI,
        isConceptExplanation
    };
});
