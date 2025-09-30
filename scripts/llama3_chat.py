#!/usr/bin/env python3
"""
Llama 3 Chat Integration Script
This script interfaces with your local Llama 3 installation
"""

import sys
import json
import subprocess
import os

def call_llama3(prompt):
    """
    Call your local Llama 3 installation
    Adjust this function based on your Llama 3 setup
    """
    try:
        # Option 1: If you have llama.cpp installed
        # cmd = [
        #     'llama-cli',
        #     '--model', '/path/to/your/llama3/model',
        #     '--prompt', prompt,
        #     '--n-predict', '200'
        # ]
        
        # Option 2: If you have Ollama installed
        cmd = [
            'ollama', 'run', 'llama3',
            prompt
        ]
        
        # Option 3: If you have a custom Python script
        # cmd = ['python', '/path/to/your/llama3_script.py', prompt]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            return f"Error: {result.stderr}"
            
    except subprocess.TimeoutExpired:
        return "Sorry, the AI is taking too long to respond. Please try again."
    except FileNotFoundError:
        return "Llama 3 is not properly installed. Please check your installation."
    except Exception as e:
        return f"Error calling Llama 3: {str(e)}"

def main():
    # Read the prompt from stdin
    prompt = sys.stdin.read().strip()
    
    if not prompt:
        print("No prompt provided")
        sys.exit(1)
    
    # Call Llama 3
    response = call_llama3(prompt)
    
    # Output the response
    print(response)

if __name__ == "__main__":
    main()
