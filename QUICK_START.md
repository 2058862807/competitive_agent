# 🚀 NextAI Global - AI Office Manager Quick Start

## What You Have

A **complete, dynamic AI Office Manager** for NextAI Global with:
- ✅ Self-learning AI agent (multi-model competitive generation)
- ✅ Document scanner with AI analysis
- ✅ Fax & Email automation
- ✅ Marketing & social media automation
- ✅ Video & commercial generation
- ✅ Website monitoring & management
- ✅ Full business dashboard

## Get Started in 3 Steps

### 1️⃣ Add Your OpenRouter API Key (Required for AI Agent)

```bash
nano /app/backend/.env
```

Find this line:
```
OPENROUTER_API_KEY="your-openrouter-api-key-here"
```

Replace with your actual key from https://openrouter.ai/

```bash
sudo supervisorctl restart backend
```

### 2️⃣ Test the System

**Open your application** in the browser and try:

**Document Scanner:**
- Navigate to "Document Scanner"
- Upload a PDF, Word doc, or image
- Watch AI analyze and extract key information

**AI Office Manager:**
- Go to "AI Office Manager"  
- Chat: "Create a LinkedIn post about AI estate planning"
- Or: "Draft an email reply to a client inquiry"
- Or: "Generate a 30-second commercial script"

**Marketing:**
- Visit "Marketing Automation"
- Generate social media posts
- Create complete marketing campaigns

**Video Creation:**
- Go to "Video & Commercials"
- Generate scripts for any duration
- Create professional video content

**Website Manager:**
- Check "Website Manager"
- Monitor uptime and performance
- Get SEO recommendations
- Generate page content

### 3️⃣ Add More API Keys (Optional)

For full functionality, add these to `/app/backend/.env`:

**Communication:**
```bash
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
SENDGRID_API_KEY="your-sendgrid-key"
```

**Social Media:**
```bash
LINKEDIN_ACCESS_TOKEN="your-token"
TWITTER_API_KEY="your-key"
FACEBOOK_PAGE_ACCESS_TOKEN="your-token"
INSTAGRAM_ACCESS_TOKEN="your-token"
```

**Video Generation:**
```bash
SYNTHESIA_API_KEY="your-key"
ELEVENLABS_API_KEY="your-key"
```

After adding keys:
```bash
sudo supervisorctl restart backend
```

## API Endpoints Available

### AI & Chat
- `POST /api/chat` - Chat with AI agent
- `GET /api/chat/history` - Get chat history

### Documents
- `POST /api/documents/upload` - Upload & analyze document
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document details

### Communication
- `POST /api/communication/fax` - Send fax
- `POST /api/communication/email` - Send email
- `POST /api/communication/email/reply` - Generate AI email reply

### Marketing
- `POST /api/marketing/generate-post` - Generate social post
- `POST /api/marketing/post` - Post to social media
- `POST /api/marketing/campaign` - Generate marketing campaign
- `GET /api/marketing/posts` - List generated posts
- `GET /api/marketing/campaigns` - List campaigns

### Video
- `POST /api/video/generate-script` - Generate commercial script
- `POST /api/video/generate` - Generate video
- `GET /api/video/scripts` - List scripts

### Website
- `GET /api/website/status` - Check website status
- `GET /api/website/seo-analysis` - Analyze SEO
- `POST /api/website/generate-content` - Generate page content
- `GET /api/website/history` - Status check history

### Business (Original features)
- Dashboard stats, customers, sales, refunds, issues

## Testing Examples

### Test Document Processing
```bash
curl -X POST http://localhost:8001/api/documents/upload \
  -F "file=@your-document.pdf"
```

### Test AI Chat
```bash
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a LinkedIn post about AI trust planning"}'
```

### Test Marketing
```bash
curl -X POST http://localhost:8001/api/marketing/generate-post \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI Estate Planning", "platform": "linkedin"}'
```

### Test Video Script
```bash
curl -X POST http://localhost:8001/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"duration": 30, "focus": "AI Services"}'
```

### Check Website
```bash
curl http://localhost:8001/api/website/status
```

## How It Works

### The AI Agent is Dynamic
Ask it to do ANYTHING office-related:
- "Analyze this document and create action items"
- "Draft a professional email to a client"  
- "Create a week of social media content"
- "Write a 60-second commercial script"
- "Give me SEO recommendations for my website"

The agent coordinates ALL office tasks intelligently using the self-learning multi-model system!

### Document Processing Flow
1. Upload document (any format)
2. AI extracts text (OCR for images)
3. AI analyzes content
4. Categorizes and suggests actions
5. Can forward to AI agent for follow-up

### Marketing Automation
1. Specify topic + platform
2. AI generates optimized content
3. Post directly or review first
4. Track performance

### Video Creation
1. AI generates professional script
2. Optionally generate video using Synthesia
3. Download or share

## Troubleshooting

**AI not responding?**
```bash
# Check if API key is set
grep OPENROUTER_API_KEY /app/backend/.env

# Restart backend
sudo supervisorctl restart backend

# Check logs
tail -f /var/log/supervisor/backend.*.log
```

**Upload not working?**
```bash
# Check uploads folder
ls -la /app/backend/uploads

# Check permissions
chmod 777 /app/backend/uploads
```

**Frontend not loading?**
```bash
sudo supervisorctl restart frontend
tail -f /var/log/supervisor/frontend.*.log
```

## Production Tips

1. **Start with OpenRouter key** - This activates the AI agent
2. **Test document upload** - Upload a sample PDF
3. **Try AI chat** - Ask it to create marketing content
4. **Add other APIs gradually** - Communication, social, video as needed
5. **Monitor logs** - Keep an eye on `/var/log/supervisor/`

## Next Steps

1. ✅ Add OpenRouter API key
2. ✅ Test AI Office Manager chat
3. ✅ Upload a test document
4. ✅ Generate social media content
5. ⬜ Add communication APIs (Twilio, SendGrid)
6. ⬜ Add social media tokens
7. ⬜ Configure video generation

## Support

All integrations have helpful error messages. If an API isn't configured, the system tells you exactly what's needed!

Check `/app/README.md` for detailed documentation.

---

**You're ready to go! 🎉**

Open the frontend URL and start using your AI Office Manager!
