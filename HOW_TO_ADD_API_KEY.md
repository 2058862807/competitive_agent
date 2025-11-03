# How to Add Your OpenRouter API Key

## Step 1: Get Your OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to your API keys section
4. Create a new API key or copy your existing one

## Step 2: Add the API Key to the Backend

### Method 1: Edit the .env file directly

```bash
# Open the backend .env file
nano /app/backend/.env

# Or use vi/vim
vi /app/backend/.env
```

Find this line:
```
OPENROUTER_API_KEY="your-openrouter-api-key-here"
```

Replace `your-openrouter-api-key-here` with your actual API key:
```
OPENROUTER_API_KEY="sk-or-v1-abc123xyz..."
```

Save and exit (Ctrl+X, then Y, then Enter for nano)

### Method 2: Using command line

```bash
# Replace YOUR_KEY_HERE with your actual API key
sed -i 's/your-openrouter-api-key-here/YOUR_KEY_HERE/g' /app/backend/.env
```

## Step 3: Restart the Backend

```bash
sudo supervisorctl restart backend
```

Wait a few seconds for the backend to restart, then check the status:

```bash
sudo supervisorctl status backend
```

## Step 4: Verify the Configuration

Test that the AI agent is working:

```bash
curl -X POST http://localhost:8001/api/health
```

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "ai_agent": "ready"
}
```

## Step 5: Test the AI Chat

Try sending a test message:

```bash
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me?"}'
```

## Customizing AI Models (Optional)

You can customize which models the agent uses by editing the same `.env` file:

```bash
# Primary model for candidate generation
AI_MODEL_PRIMARY="openai/gpt-4-turbo"

# Secondary model for candidate generation
AI_MODEL_SECONDARY="anthropic/claude-3.5-sonnet"

# Tertiary model for candidate generation
AI_MODEL_TERTIARY="google/gemini-pro"

# Model used for peer review
AI_MODEL_REVIEW="openai/gpt-4-turbo"

# Number of candidates to generate (1-3, depending on models available)
AI_NUM_CANDIDATES=3
```

### Popular Model Options

**For High Quality** (Higher cost):
```bash
AI_MODEL_PRIMARY="openai/gpt-4-turbo"
AI_MODEL_SECONDARY="anthropic/claude-3.5-sonnet"
AI_MODEL_TERTIARY="google/gemini-pro"
AI_MODEL_REVIEW="openai/gpt-4-turbo"
```

**For Balance** (Medium cost):
```bash
AI_MODEL_PRIMARY="openai/gpt-3.5-turbo"
AI_MODEL_SECONDARY="anthropic/claude-3-haiku"
AI_MODEL_TERTIARY="google/gemini-flash"
AI_MODEL_REVIEW="openai/gpt-3.5-turbo"
```

**For Speed** (Lower cost):
```bash
AI_MODEL_PRIMARY="google/gemini-flash"
AI_MODEL_SECONDARY="mistralai/mistral-7b-instruct"
AI_MODEL_TERTIARY="meta-llama/llama-3-8b-instruct"
AI_MODEL_REVIEW="google/gemini-flash"
```

After changing models, restart the backend:
```bash
sudo supervisorctl restart backend
```

## Troubleshooting

### Issue: AI agent shows "not initialized"

**Solution**: Make sure you've set the API key and restarted the backend.

### Issue: "Rate limit exceeded" error

**Solution**: 
1. Check your OpenRouter account for rate limits
2. Reduce `AI_NUM_CANDIDATES` to 2 or 1
3. Increase `RATE_LIMIT_WINDOW` in the .env file

### Issue: "Invalid API key" error

**Solution**:
1. Double-check your API key is correct
2. Make sure there are no extra spaces or quotes
3. Verify the key is active on OpenRouter

### Issue: Models not responding

**Solution**:
1. Check if the model names are correct (see [OpenRouter Models](https://openrouter.ai/models))
2. Verify your OpenRouter account has credits
3. Try using different models

## Checking Logs

To see detailed logs of what's happening:

```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Look for AI agent initialization
grep "agent_initialized" /var/log/supervisor/backend.*.log

# Look for errors
grep "ERROR" /var/log/supervisor/backend.*.log
```

## Getting Help

If you're still having issues:

1. Check the logs for specific error messages
2. Verify your OpenRouter account status
3. Test your API key directly with OpenRouter's API
4. Make sure all services are running: `sudo supervisorctl status`

## Security Note

⚠️ **Never commit your API key to version control!**

The `.env` file should be in your `.gitignore`. If you need to share the project, create a `.env.example` file with placeholder values.

## Cost Management

To manage OpenRouter costs:

1. Set spending limits in your OpenRouter account
2. Use cheaper models for development/testing
3. Reduce `AI_NUM_CANDIDATES` to lower the number of API calls
4. Monitor usage in your OpenRouter dashboard

## Next Steps

Once your API key is configured:

1. Open the frontend in your browser
2. Navigate to "AI Agent Chat"
3. Start chatting with the self-learning AI agent!
4. Check the dashboard to see all the business metrics

Enjoy! 🚀
