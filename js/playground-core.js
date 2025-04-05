// Enhanced Code Playground Core Functionality
// Handles the main code editor and execution features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror editor with improved settings
    const codeEditor = CodeMirror(document.getElementById('code-editor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": function(cm) {
                const spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
            },
            "Ctrl-/": "toggleComment",
            "Ctrl-F": "findPersistent"
        },
        lint: true,
        styleActiveLine: true
    });

    // Set default code
    codeEditor.setValue(`// Welcome to TechLearn Enhanced Code Playground
// Try writing some code and click Run to execute it

function greet(name) {
    return "Hello, " + name + "! Welcome to TechLearn.";
}

console.log(greet("Student"));
`);

    // Language selector with expanded options
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', function() {
        const language = this.value;
        
        // Change editor mode based on selected language
        switch(language) {
            case 'javascript':
                codeEditor.setOption('mode', 'javascript');
                codeEditor.setOption('lint', true);
                break;
            case 'python':
                codeEditor.setOption('mode', 'python');
                codeEditor.setOption('lint', false); // Python linting requires additional setup
                setDefaultCodeForLanguage('python');
                break;
            case 'java':
                codeEditor.setOption('mode', 'text/x-java');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('java');
                break;
            case 'cpp':
                codeEditor.setOption('mode', 'text/x-c++src');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('cpp');
                break;
            case 'csharp':
                codeEditor.setOption('mode', 'text/x-csharp');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('csharp');
                break;
            case 'html':
                codeEditor.setOption('mode', 'htmlmixed');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('html');
                break;
            case 'php':
                codeEditor.setOption('mode', 'application/x-httpd-php');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('php');
                break;
            case 'ruby':
                codeEditor.setOption('mode', 'ruby');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('ruby');
                break;
            case 'go':
                codeEditor.setOption('mode', 'go');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('go');
                break;
            case 'rust':
                codeEditor.setOption('mode', 'rust');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('rust');
                break;
            case 'swift':
                codeEditor.setOption('mode', 'swift');
                codeEditor.setOption('lint', false);
                setDefaultCodeForLanguage('swift');
                break;
        }
    });

    // Set default code based on language
    function setDefaultCodeForLanguage(language) {
        let defaultCode = '';
        
        switch(language) {
            case 'python':
                defaultCode = `# Welcome to TechLearn Python Playground
# Try writing some code and click Run to execute it

def greet(name):
    return f"Hello, {name}! Welcome to TechLearn."

print(greet("Student"))
`;
                break;
            case 'java':
                defaultCode = `// Welcome to TechLearn Java Playground
// Note: This is a simplified environment

public class Main {
    public static void main(String[] args) {
        System.out.println(greet("Student"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "! Welcome to TechLearn.";
    }
}
`;
                break;
            case 'cpp':
                defaultCode = `// Welcome to TechLearn C++ Playground
// Note: This is a simplified environment

#include <iostream>
#include <string>

std::string greet(std::string name) {
    return "Hello, " + name + "! Welcome to TechLearn.";
}

int main() {
    std::cout << greet("Student") << std::endl;
    return 0;
}
`;
                break;
            case 'csharp':
                defaultCode = `// Welcome to TechLearn C# Playground
// Note: This is a simplified environment

using System;

class Program {
    static void Main() {
        Console.WriteLine(Greet("Student"));
    }
    
    static string Greet(string name) {
        return $"Hello, {name}! Welcome to TechLearn.";
    }
}
`;
                break;
            case 'html':
                defaultCode = `<!-- Welcome to TechLearn HTML/CSS Playground -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
        }
        .greeting {
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 {
            color: #4a6cf7;
        }
    </style>
</head>
<body>
    <div class="greeting">
        <h1>Hello, Student!</h1>
        <p>Welcome to TechLearn HTML/CSS Playground.</p>
    </div>
</body>
</html>
`;
                break;
            case 'php':
                defaultCode = `<?php
// Welcome to TechLearn PHP Playground
// Try writing some code and click Run to execute it

function greet($name) {
    return "Hello, " . $name . "! Welcome to TechLearn.";
}

echo greet("Student");
?>
`;
                break;
            case 'ruby':
                defaultCode = `# Welcome to TechLearn Ruby Playground
# Try writing some code and click Run to execute it

def greet(name)
  "Hello, #{name}! Welcome to TechLearn."
end

puts greet("Student")
`;
                break;
            case 'go':
                defaultCode = `// Welcome to TechLearn Go Playground
// Try writing some code and click Run to execute it

package main

import "fmt"

func greet(name string) string {
    return "Hello, " + name + "! Welcome to TechLearn."
}

func main() {
    fmt.Println(greet("Student"))
}
`;
                break;
            case 'rust':
                defaultCode = `// Welcome to TechLearn Rust Playground
// Try writing some code and click Run to execute it

fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to TechLearn.", name)
}

fn main() {
    println!("{}", greet("Student"));
}
`;
                break;
            case 'swift':
                defaultCode = `// Welcome to TechLearn Swift Playground
// Try writing some code and click Run to execute it

func greet(name: String) -> String {
    return "Hello, \\(name)! Welcome to TechLearn."
}

print(greet(name: "Student"))
`;
                break;
        }
        
        codeEditor.setValue(defaultCode);
    }

    // Run code button with improved execution
    const runCodeBtn = document.getElementById('run-code-btn');
    const outputConsole = document.getElementById('output-console');
    
    runCodeBtn.addEventListener('click', function() {
        // Clear previous output
        outputConsole.innerHTML = '';
        
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running code...';
        outputConsole.appendChild(loadingIndicator);
        
        // Get code and language
        const code = codeEditor.getValue();
        const language = languageSelect.value;
        
        // Delay execution slightly to allow UI to update
        setTimeout(function() {
            // Remove loading indicator
            outputConsole.removeChild(loadingIndicator);
            
            // Execute code based on language
            if (language === 'javascript') {
                executeJavaScript(code);
            } else {
                // For other languages, we'll simulate execution with error detection
                simulateExecution(code, language);
            }
        }, 500);
    });
    
    // Execute JavaScript code with improved error handling
    function executeJavaScript(code) {
        try {
            // Create a safe way to capture console.log output
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            const logs = [];
            
            // Override console methods
            console.log = function() {
                logs.push({type: 'log', content: Array.from(arguments).join(' ')});
                originalLog.apply(console, arguments);
            };
            
            console.warn = function() {
                logs.push({type: 'warning', content: Array.from(arguments).join(' ')});
                originalWarn.apply(console, arguments);
            };
            
            console.error = function() {
                logs.push({type: 'error', content: Array.from(arguments).join(' ')});
                originalError.apply(console, arguments);
            };
            
            // Execute the code
            const result = new Function(code)();
            
            // Display logs
            logs.forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = `console-message ${log.type}`;
                logElement.textContent = log.content;
                outputConsole.appendChild(logElement);
            });
            
            // Display result if not undefined
            if (result !== undefined) {
                const resultElement = document.createElement('div');
                resultElement.className = 'console-message result';
                resultElement.textContent = '→ ' + result;
                outputConsole.appendChild(resultElement);
            }
            
            // Restore original console methods
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        } catch (error) {
            handleJavaScriptError(error, code);
        }
    }
    
    // Handle JavaScript errors with detailed analysis
    function handleJavaScriptError(error, code) {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'console-message error';
        
        // Basic error message
        errorElement.innerHTML = `<div class="error-header">
            <i class="fas fa-exclamation-circle"></i> ${escapeHTML(error.toString())}
        </div>`;
        
        // Extract line number if available
        let lineNumber = null;
        const stackLines = error.stack.split('\n');
        for (const line of stackLines) {
            const match = line.match(/<anonymous>:(\d+):(\d+)/);
            if (match) {
                lineNumber = parseInt(match[1]) - 1; // Adjust for function wrapper
                break;
            }
        }
        
        // Add error details
        const errorDetails = document.createElement('div');
        errorDetails.className = 'error-details';
        
        // If we have a line number, show the problematic code
        if (lineNumber !== null) {
            const codeLines = code.split('\n');
            const startLine = Math.max(0, lineNumber - 2);
            const endLine = Math.min(codeLines.length - 1, lineNumber + 2);
            
            let codeSnippet = '<div class="code-snippet">';
            for (let i = startLine; i <= endLine; i++) {
                const isErrorLine = i === lineNumber;
                codeSnippet += `<div class="snippet-line ${isErrorLine ? 'error-line' : ''}">
                    <span class="line-number">${i + 1}</span>
                    <span class="line-content">${escapeHTML(codeLines[i])}</span>
                </div>`;
            }
            codeSnippet += '</div>';
            
            errorDetails.innerHTML = codeSnippet;
        }
        
        // Add error explanation
        const errorExplanation = document.createElement('div');
        errorExplanation.className = 'error-explanation';
        errorExplanation.innerHTML = `<p>${getErrorExplanation(error)}</p>
            <button class="voice-explain-btn" data-error="${escapeHTML(error.toString())}">
                <i class="fas fa-volume-up"></i> Explain with Voice
            </button>`;
        
        errorDetails.appendChild(errorExplanation);
        errorElement.appendChild(errorDetails);
        outputConsole.appendChild(errorElement);
        
        // Add event listener to voice explain button
        errorElement.querySelector('.voice-explain-btn').addEventListener('click', function() {
            const errorMessage = this.getAttribute('data-error');
            explainErrorWithVoice(errorMessage);
        });
    }
    
    // Simulate execution for non-JavaScript languages with error detection
    function simulateExecution(code, language) {
        // Check for common syntax errors based on language
        const errors = detectSyntaxErrors(code, language);
        
        if (errors.length > 0) {
            // Display errors
            errors.forEach(error => {
                const errorElement = document.createElement('div');
                errorElement.className = 'console-message error';
                
                errorElement.innerHTML = `<div class="error-header">
                    <i class="fas fa-exclamation-circle"></i> ${error.message}
                </div>`;
                
                // Add error details
                if (error.line !== null) {
                    const codeLines = code.split('\n');
                    const startLine = Math.max(0, error.line - 2);
                    const endLine = Math.min(codeLines.length - 1, error.line + 2);
                    
                    let codeSnippet = '<div class="code-snippet">';
                    for (let i = startLine; i <= endLine; i++) {
                        const isErrorLine = i === error.line;
                        codeSnippet += `<div class="snippet-line ${isErrorLine ? 'error-line' : ''}">
                            <span class="line-number">${i + 1}</span>
                            <span class="line-content">${escapeHTML(codeLines[i])}</span>
                        </div>`;
                    }
                    codeSnippet += '</div>';
                    
                    const errorDetails = document.createElement('div');
                    errorDetails.className = 'error-details';
                    errorDetails.innerHTML = codeSnippet;
                    
                    // Add error explanation
                    const errorExplanation = document.createElement('div');
                    errorExplanation.className = 'error-explanation';
                    errorExplanation.innerHTML = `<p>${error.explanation}</p>
                        <button class="voice-explain-btn" data-error="${escapeHTML(error.message)}">
                            <i class="fas fa-volume-up"></i> Explain with Voice
                        </button>`;
                    
                    errorDetails.appendChild(errorExplanation);
                    errorElement.appendChild(errorDetails);
                }
                
                outputConsole.appendChild(errorElement);
                
                // Add event listener to voice explain button
                const voiceBtn = errorElement.querySelector('.voice-explain-btn');
                if (voiceBtn) {
                    voiceBtn.addEventListener('click', function() {
                        const errorMessage = this.getAttribute('data-error');
                        explainErrorWithVoice(errorMessage);
                    });
                }
            });
            
            return;
        }
        
        // If no errors, show simulated output
        const outputElement = document.createElement('div');
        outputElement.className = 'console-message';
        outputElement.innerHTML = getSimulatedOutput(code, language);
        outputConsole.appendChild(outputElement);
    }
    
    // Detect syntax errors in different languages
    function detectSyntaxErrors(code, language) {
        const errors = [];
        
        switch(language) {
            case 'python':
                // Check for common Python syntax errors
                detectPythonErrors(code, errors);
                break;
            case 'java':
                // Check for common Java syntax errors
                detectJavaErrors(code, errors);
                break;
            case 'cpp':
                // Check for common C++ syntax errors
                detectCppErrors(code, errors);
                break;
            // Add more language-specific error detection as needed
        }
        
        return errors;
    }
    
    // Export functions for use in other modules
    window.playgroundCore = {
        codeEditor,
        executeJavaScript,
        simulateExecution,
        detectSyntaxErrors,
        handleJavaScriptError,
        getErrorExplanation
    };
});
