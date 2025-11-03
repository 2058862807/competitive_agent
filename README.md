# OfficeFlow AI - Self-Learning Agent System

A comprehensive business management platform powered by a self-learning AI agent using OpenRouter API with competitive multi-model generation and peer review.

## Features

### 🤖 AI Agent
- **Multi-Model Competitive Generation**: Generates multiple candidate solutions using different AI models
- **Peer Review System**: Each response is reviewed and improved by a separate reviewer model
- **Self-Learning**: Agent learns from successful interactions and improves over time
- **OpenRouter Integration**: Supports multiple AI providers (OpenAI, Anthropic, Google, etc.)

### 💼 Business Management
- **Customer Management**: Track and manage customer database
- **Sales Tracking**: Record and monitor sales transactions
- **Refund Processing**: Handle refund requests with approval workflow
- **Issue Tracking**: Manage customer issues with priority and status tracking
- **Dashboard Analytics**: Real-time business metrics and insights

### 🔧 AI Features
- AI Agent Chat - Interactive conversation with self-learning agent
- AI Content Test - Validate AI-generated content
- Mail Assistant - AI-powered email management
- Email Helper - Automated email workflows

## Quick Start

### Prerequisites
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- MongoDB running locally
- Node.js and Python installed

### Configuration

1. **Add your OpenRouter API key**:
   ```bash
   # Edit /app/backend/.env
   OPENROUTER_API_KEY="your-openrouter-api-key-here"
   ```

2. **Configure AI Models** (Optional):
   ```bash
   # In /app/backend/.env
   AI_MODEL_PRIMARY="openai/gpt-4-turbo"
   AI_MODEL_SECONDARY="anthropic/claude-3.5-sonnet"
   AI_MODEL_TERTIARY="google/gemini-pro"
   AI_MODEL_REVIEW="openai/gpt-4-turbo"
   ```

3. **Restart the backend**:
   ```bash
   sudo supervisorctl restart backend
   ```

### Running the Application

The application runs automatically via supervisor:

```bash
# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

### Seeding Sample Data

To populate the database with sample data:

```bash
cd /app/backend
python seed_data.py
```

## Project Structure

```
/app/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── ai_agent.py         # Self-learning AI agent implementation
│   ├── seed_data.py        # Database seeding script
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (API keys)
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # React page components
│   │   ├── components/    # Reusable UI components
│   │   ├── api/          # API client
│   │   └── App.js        # Main application
│   └── package.json       # Node dependencies
│
└── README.md
```

## API Endpoints

### Business Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create sale
- `GET /api/refunds` - List all refunds
- `POST /api/refunds` - Create refund request
- `PUT /api/refunds/{id}` - Update refund status
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create issue
- `PUT /api/issues/{id}` - Update issue

### AI Agent Endpoints
- `POST /api/chat` - Send message to AI agent
- `GET /api/chat/history` - Get chat history
- `GET /api/health` - Health check

## AI Agent Architecture

### Competitive Generation
The agent generates multiple candidate solutions using different AI models with varied temperature settings, creating diversity in responses.

### Peer Review
Each candidate solution is reviewed by a separate reviewer model that:
- Scores the solution (0-10) based on accuracy, reasoning, novelty, and conciseness
- Identifies critical flaws
- Provides an improved version

### Self-Learning
The agent stores successful interactions in a vector database (FAISS) and uses them to:
- Improve future responses
- Learn from high-quality solutions
- Trigger retraining when significant improvements are detected

### Security Features
- Prompt injection detection
- Rate limiting
- Input sanitization
- Request validation
- Circuit breakers for model endpoints

## Supported OpenRouter Models

The system supports any model available on OpenRouter, including:
- **OpenAI**: GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini Pro, Gemini Flash
- **Meta**: Llama 3.1
- **Mistral**: Mixtral, Mistral Large
- And many more!

See [OpenRouter Models](https://openrouter.ai/models) for the complete list.

## Environment Variables

### Required
```bash
OPENROUTER_API_KEY=your-key-here
MONGO_URL=mongodb://localhost:27017
DB_NAME=officeflow_db
```

### Optional Configuration
```bash
# AI Model Selection
AI_MODEL_PRIMARY=openai/gpt-4-turbo
AI_MODEL_SECONDARY=anthropic/claude-3.5-sonnet
AI_MODEL_TERTIARY=google/gemini-pro
AI_MODEL_REVIEW=openai/gpt-4-turbo

# Agent Configuration
AI_NUM_CANDIDATES=3
AI_IMPROVEMENT_THRESHOLD=0.15

# Security
MAX_PROMPT_LENGTH=4096
MAX_TOKENS=4096
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# CORS
CORS_ORIGINS=*
```

## Usage Tips

### Getting the Best AI Responses
1. Be specific and detailed in your questions
2. Provide context for better understanding
3. The agent learns from interactions, so quality improves over time

### Model Selection
- **GPT-4 Turbo**: Best for complex reasoning and accuracy
- **Claude 3.5 Sonnet**: Excellent for analysis and creative tasks
- **Gemini Pro**: Good balance of speed and quality
- Use mix of models for competitive generation

### Monitoring
- Check `/api/health` endpoint for system status
- Review chat history to see quality scores
- Monitor processing times for performance

## Development

### Adding New Features
1. Backend: Add routes in `server.py`
2. Frontend: Create pages in `src/pages/`
3. API: Update `src/api/index.js`

### Testing AI Agent
```bash
# Test the agent directly
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain quantum computing"}'
```

## Troubleshooting

### AI Agent Not Responding
1. Check if OpenRouter API key is set correctly
2. Verify backend is running: `sudo supervisorctl status backend`
3. Check logs: `tail -f /var/log/supervisor/backend.*.log`

### Database Connection Issues
1. Ensure MongoDB is running: `sudo supervisorctl status mongodb`
2. Verify MONGO_URL in `.env`

### Frontend Not Loading
1. Check frontend status: `sudo supervisorctl status frontend`
2. View logs: `tail -f /var/log/supervisor/frontend.*.log`
3. Restart: `sudo supervisorctl restart frontend`

## License

MIT License - Feel free to use and modify for your needs!

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Confirm OpenRouter API key is valid

## Next Steps

1. **Add Your API Key**: Edit `/app/backend/.env` and add your OpenRouter API key
2. **Explore the Dashboard**: Navigate to the frontend URL to see business metrics
3. **Try the AI Chat**: Go to "AI Agent Chat" to interact with the self-learning agent
4. **Manage Your Business**: Use Customers, Sales, Refunds, and Issues features

Enjoy your OfficeFlow AI system! 🚀
