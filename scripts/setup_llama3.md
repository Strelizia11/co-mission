# Llama 3 Setup Guide for Co-Mission Chatbot

## Prerequisites

1. **Python 3.8+** installed
2. **Llama 3 model** downloaded locally
3. **Ollama** (recommended) or **llama.cpp** installed

## Option 1: Using Ollama (Recommended)

### Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Pull Llama 3 Model
```bash
ollama pull llama3
```

### Test Installation
```bash
ollama run llama3 "Hello, how are you?"
```

## Option 2: Using llama.cpp

### Install llama.cpp
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make
```

### Download Llama 3 Model
Download the model files and place them in the llama.cpp directory.

### Test Installation
```bash
./llama-cli --model your-model.gguf --prompt "Hello" --n-predict 50
```

## Option 3: Custom Python Script

Create a custom Python script that interfaces with your Llama 3 installation:

```python
# custom_llama3.py
import subprocess
import sys

def call_llama3(prompt):
    # Your custom implementation here
    # This could be a REST API call, subprocess call, etc.
    pass
```

## Configuration

Update the `scripts/llama3_chat.py` file to match your setup:

### For Ollama (Default)
```python
cmd = [
    'ollama', 'run', 'llama3',
    prompt
]
```

### For llama.cpp
```python
cmd = [
    'llama-cli',
    '--model', '/path/to/your/llama3/model.gguf',
    '--prompt', prompt,
    '--n-predict', '200'
]
```

### For Custom Implementation
```python
# Replace the cmd array with your custom implementation
result = your_custom_llama3_call(prompt)
```

## Testing the Chatbot

1. Start your Next.js application:
```bash
npm run dev
```

2. Open the chat widget (floating button in bottom-right)
3. Send a test message
4. Check the console for any errors

## Troubleshooting

### Common Issues

1. **"Llama 3 is not properly installed"**
   - Check if Ollama is running: `ollama list`
   - Verify the model is downloaded: `ollama list`
   - Test manually: `ollama run llama3 "test"`

2. **"Timeout" errors**
   - Increase timeout in the Python script
   - Check system resources (RAM, CPU)
   - Try a smaller model

3. **"Permission denied"**
   - Make sure the Python script is executable: `chmod +x scripts/llama3_chat.py`
   - Check file permissions

4. **"Module not found"**
   - Install required Python packages
   - Check Python path

### Performance Optimization

1. **Use a smaller model** for faster responses
2. **Adjust n-predict** parameter to limit response length
3. **Add caching** for common responses
4. **Use GPU acceleration** if available

## Security Considerations

1. **Input validation** - The API already validates input
2. **Rate limiting** - Consider adding rate limiting
3. **Content filtering** - Add content filtering if needed
4. **Resource limits** - Monitor CPU and memory usage

## Monitoring

Monitor the chatbot performance:
- Response times
- Error rates
- User satisfaction
- Resource usage

## Updates

To update the model:
```bash
ollama pull llama3
```

Or download a newer version of your model file.
