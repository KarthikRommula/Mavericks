// Error Detection Module for TechLearn Code Playground
// Provides advanced error detection and explanation for different programming languages
// Enhanced with Gemini AI integration for intelligent error analysis

// Detect Python errors
function detectPythonErrors(code, errors) {
    // Check for indentation errors
    const lines = code.split('\n');
    let previousIndent = 0;
    let inBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimRight();
        if (line.trim() === '' || line.trim().startsWith('#')) continue;
        
        // Count leading spaces
        const indent = line.length - line.trimLeft().length;
        
        // Check for inconsistent indentation
        if (inBlock && indent <= previousIndent && !line.match(/^(else|elif|except|finally):/)) {
            errors.push({
                line: i,
                message: `IndentationError: unexpected indent at line ${i + 1}`,
                explanation: 'Python uses indentation to define code blocks. Make sure your indentation is consistent throughout the code block.'
            });
        }
        
        // Check for missing colon in control structures
        if (line.match(/^(\s*)(if|for|while|def|class|with|try|except|finally|elif|else)\s+.*[^:]\s*$/)) {
            errors.push({
                line: i,
                message: `SyntaxError: invalid syntax at line ${i + 1}`,
                explanation: 'Control structures in Python (if, for, while, etc.) must end with a colon (:).'
            });
        }
        
        // Check for undefined variables
        const variableMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (variableMatch) {
            const variableName = variableMatch[2];
            // This is a simplified check and would need more context for accurate detection
        }
        
        // Update state for next line
        if (line.endsWith(':')) {
            inBlock = true;
            previousIndent = indent;
        }
    }
    
    // Check for unmatched parentheses, brackets, and braces
    let parentheses = 0, brackets = 0, braces = 0;
    for (let i = 0; i < code.length; i++) {
        switch (code[i]) {
            case '(': parentheses++; break;
            case ')': parentheses--; break;
            case '[': brackets++; break;
            case ']': brackets--; break;
            case '{': braces++; break;
            case '}': braces--; break;
        }
        
        if (parentheses < 0) {
            errors.push({
                line: getLineNumberFromPosition(code, i),
                message: 'SyntaxError: unmatched closing parenthesis )',
                explanation: 'You have a closing parenthesis ) without a matching opening parenthesis (. Check your parentheses to ensure they are balanced.'
            });
            break;
        }
        if (brackets < 0) {
            errors.push({
                line: getLineNumberFromPosition(code, i),
                message: 'SyntaxError: unmatched closing bracket ]',
                explanation: 'You have a closing bracket ] without a matching opening bracket [. Check your brackets to ensure they are balanced.'
            });
            break;
        }
        if (braces < 0) {
            errors.push({
                line: getLineNumberFromPosition(code, i),
                message: 'SyntaxError: unmatched closing brace }',
                explanation: 'You have a closing brace } without a matching opening brace {. Check your braces to ensure they are balanced.'
            });
            break;
        }
    }
    
    if (parentheses > 0) {
        errors.push({
            line: null,
            message: 'SyntaxError: unexpected EOF while parsing',
            explanation: 'You have an opening parenthesis ( without a matching closing parenthesis ). Check your parentheses to ensure they are balanced.'
        });
    }
    if (brackets > 0) {
        errors.push({
            line: null,
            message: 'SyntaxError: unexpected EOF while parsing',
            explanation: 'You have an opening bracket [ without a matching closing bracket ]. Check your brackets to ensure they are balanced.'
        });
    }
    if (braces > 0) {
        errors.push({
            line: null,
            message: 'SyntaxError: unexpected EOF while parsing',
            explanation: 'You have an opening brace { without a matching closing brace }. Check your braces to ensure they are balanced.'
        });
    }
}

// Detect Java errors
function detectJavaErrors(code, errors) {
    // Check for missing semicolons
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.endsWith('*/')) continue;
        if (line.endsWith('{') || line.endsWith('}') || line.endsWith(';')) continue;
        
        // Skip method declarations, if statements, etc.
        if (line.match(/^(public|private|protected|static|final|abstract|class|interface|enum|if|else|for|while|do|switch|case|default)\s+/)) continue;
        
        // Check for lines that should end with semicolons
        if (!line.match(/^(package|import|\/\/|\/\*|\*\/|@[a-zA-Z]+)/)) {
            errors.push({
                line: i,
                message: `Syntax error: missing semicolon at line ${i + 1}`,
                explanation: 'In Java, most statements must end with a semicolon (;). Add a semicolon at the end of this line.'
            });
        }
    }
    
    // Check for unmatched braces
    let braces = 0;
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '{') braces++;
        else if (code[i] === '}') braces--;
        
        if (braces < 0) {
            errors.push({
                line: getLineNumberFromPosition(code, i),
                message: 'Syntax error: unmatched closing brace }',
                explanation: 'You have a closing brace } without a matching opening brace {. Check your braces to ensure they are balanced.'
            });
            break;
        }
    }
    
    if (braces > 0) {
        errors.push({
            line: null,
            message: 'Syntax error: missing closing brace',
            explanation: 'You have an opening brace { without a matching closing brace }. Check your braces to ensure they are balanced.'
        });
    }
    
    // Check for missing main method in class
    if (code.includes('class') && !code.includes('main')) {
        errors.push({
            line: null,
            message: 'Error: main method not found',
            explanation: 'Java programs need a main method as the entry point. Add a main method with the signature: public static void main(String[] args) { ... }'
        });
    }
}

// Detect C++ errors
function detectCppErrors(code, errors) {
    // Check for missing semicolons
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.endsWith('*/')) continue;
        if (line.endsWith('{') || line.endsWith('}') || line.endsWith(';') || line.endsWith(':')) continue;
        
        // Skip preprocessor directives, function declarations, if statements, etc.
        if (line.match(/^(#|template|class|struct|enum|if|else|for|while|do|switch|case|default|public|private|protected)\s+/)) continue;
        
        // Check for lines that should end with semicolons
        if (!line.match(/^(\/\/|\/\*|\*\/)/)) {
            errors.push({
                line: i,
                message: `Syntax error: missing semicolon at line ${i + 1}`,
                explanation: 'In C++, most statements must end with a semicolon (;). Add a semicolon at the end of this line.'
            });
        }
    }
    
    // Check for unmatched braces
    let braces = 0;
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '{') braces++;
        else if (code[i] === '}') braces--;
        
        if (braces < 0) {
            errors.push({
                line: getLineNumberFromPosition(code, i),
                message: 'Syntax error: unmatched closing brace }',
                explanation: 'You have a closing brace } without a matching opening brace {. Check your braces to ensure they are balanced.'
            });
            break;
        }
    }
    
    if (braces > 0) {
        errors.push({
            line: null,
            message: 'Syntax error: missing closing brace',
            explanation: 'You have an opening brace { without a matching closing brace }. Check your braces to ensure they are balanced.'
        });
    }
    
    // Check for missing main function
    if (!code.includes('main(') && !code.includes('main (')) {
        errors.push({
            line: null,
            message: 'Error: main function not found',
            explanation: 'C++ programs need a main function as the entry point. Add a main function with the signature: int main() { ... }'
        });
    }
}

// Get line number from character position
function getLineNumberFromPosition(code, position) {
    const lines = code.substring(0, position).split('\n');
    return lines.length - 1;
}

// Get detailed explanation for JavaScript errors
function getErrorExplanation(error) {
    const errorType = error.name;
    const errorMessage = error.message;
    
    // Common JavaScript errors and their explanations
    const explanations = {
        'SyntaxError': {
            'Unexpected token': 'There is a syntax error in your code. Check for mismatched brackets, missing commas, or other syntax issues.',
            'Unexpected identifier': 'You might be using a variable name in an unexpected place, or missing an operator or punctuation.',
            'Unexpected end of input': 'Your code has an unclosed bracket, parenthesis, or quote. Check for balanced pairs.',
            'Invalid or unexpected token': 'You might have used an invalid character or symbol in your code.',
            'Missing initializer in const declaration': 'When declaring a const variable, you must initialize it with a value.',
            'Missing } after property list': 'You have an object literal with an unclosed brace. Add a closing brace.'
        },
        'ReferenceError': {
            'is not defined': 'You are trying to use a variable or function that hasn\'t been declared or is out of scope.',
            'Cannot access before initialization': 'You\'re trying to use a variable before it\'s been initialized. Move the declaration earlier in your code.'
        },
        'TypeError': {
            'is not a function': 'You\'re trying to call something that isn\'t a function. Check the variable name and type.',
            'Cannot read property': 'You\'re trying to access a property of undefined or null. Check if the object exists before accessing its properties.',
            'is not iterable': 'You\'re trying to iterate over something that isn\'t iterable (like using a for...of loop on a number).',
            'is not a constructor': 'You\'re trying to use "new" with something that isn\'t a constructor function.'
        },
        'RangeError': {
            'Maximum call stack size exceeded': 'You have infinite recursion in your code. Check your recursive function calls.',
            'Invalid array length': 'You\'re trying to create an array with an invalid length (negative or too large).'
        }
    };
    
    // Find matching explanation
    if (explanations[errorType]) {
        for (const pattern in explanations[errorType]) {
            if (errorMessage.includes(pattern)) {
                return explanations[errorType][pattern];
            }
        }
    }
    
    // Default explanation if no specific match found
    return `This is a ${errorType}. It typically occurs when ${getDefaultErrorDescription(errorType)}.`;
}

// Get default description for error types
function getDefaultErrorDescription(errorType) {
    switch (errorType) {
        case 'SyntaxError':
            return 'there is a problem with the syntax of your code';
        case 'ReferenceError':
            return 'you try to reference a variable that doesn\'t exist or is out of scope';
        case 'TypeError':
            return 'you try to perform an operation on a value of the wrong type';
        case 'RangeError':
            return 'a numeric value is outside the range of allowed values';
        case 'URIError':
            return 'there is a problem with URI encoding or decoding';
        case 'EvalError':
            return 'there is a problem with the eval() function';
        default:
            return 'there is an issue with your code logic';
    }
}

// Get simulated output for different languages
function getSimulatedOutput(code, language) {
    switch (language) {
        case 'python':
            if (code.includes('print(')) {
                // Extract print statements and simulate output
                const printMatches = code.match(/print\((.*?)\)/g) || [];
                return printMatches.map(match => {
                    const content = match.substring(6, match.length - 1);
                    return `<div>${escapeHTML(eval(`"${content}"`.replace(/'/g, '"')))}</div>`;
                }).join('');
            }
            return '<div>Program executed successfully with no output.</div>';
            
        case 'java':
            if (code.includes('System.out.println')) {
                // Extract print statements and simulate output
                const printMatches = code.match(/System\.out\.println\((.*?)\);/g) || [];
                return printMatches.map(match => {
                    const content = match.substring(19, match.length - 2);
                    return `<div>${escapeHTML(content.replace(/"/g, ''))}</div>`;
                }).join('');
            }
            return '<div>Program executed successfully with no output.</div>';
            
        case 'cpp':
            if (code.includes('std::cout')) {
                // Extract print statements and simulate output
                const printMatches = code.match(/std::cout\s*<<\s*(.*?)\s*(<<?|;)/g) || [];
                return printMatches.map(match => {
                    const content = match.replace(/std::cout\s*<<\s*/, '').replace(/\s*(<<?|;)$/, '');
                    return `<div>${escapeHTML(content.replace(/"/g, ''))}</div>`;
                }).join('');
            }
            return '<div>Program executed successfully with no output.</div>';
            
        default:
            return '<div>Program executed successfully. (Output simulation not available for this language)</div>';
    }
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add Gemini AI-powered error analysis
async function analyzeCodeWithAI(code, language, error = null) {
    if (!window.aiIntegration || !window.aiIntegration.callGeminiAPI) {
        return {
            success: false,
            message: 'AI integration not available'
        };
    }
    
    try {
        // Construct prompt based on whether there's an error or just requesting code review
        let prompt;
        if (error) {
            prompt = `I have a ${language} error: "${error}". Here's my code:\n\n${code}\n\nPlease explain what's causing this error, how to fix it, and provide best practices to avoid it in the future.`;
        } else {
            prompt = `Please review this ${language} code and provide suggestions for improvement, identify potential bugs, and explain any best practices I should follow:\n\n${code}`;
        }
        
        // Call Gemini API
        const aiResponse = await window.aiIntegration.callGeminiAPI(prompt, code);
        
        return {
            success: true,
            analysis: aiResponse
        };
    } catch (error) {
        console.error('Error analyzing code with AI:', error);
        return {
            success: false,
            message: 'Failed to analyze code with AI: ' + error.message
        };
    }
}

// Export functions for use in other modules
window.errorDetection = {
    detectPythonErrors,
    detectJavaErrors,
    detectCppErrors,
    getErrorExplanation,
    getSimulatedOutput,
    analyzeCodeWithAI,
    escapeHTML
};
