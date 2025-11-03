# 🎥 Get Your Free Video Generation API Key (D-ID)

## Quick Setup - 5 Minutes

### Step 1: Sign Up for D-ID (Free Trial)

1. Go to: https://www.d-id.com/
2. Click "Start Free Trial" or "Sign Up"
3. Sign up with your email (Google/GitHub login also works)
4. **Free trial includes: 20 credits (enough for several videos!)**

### Step 2: Get Your API Key

1. Once logged in, go to: https://studio.d-id.com/
2. Click on your profile (top right)
3. Select "API Key" or "Settings"
4. Click "Create API Key"
5. **Copy your API key** (looks like: `Basic abcd1234...`)

### Step 3: Add to Your System

```bash
# Edit the .env file
nano /app/backend/.env
```

Add this line:
```
DID_API_KEY="your-api-key-here"
```

Save and restart:
```bash
sudo supervisorctl restart backend
```

### Step 4: Generate Your Video!

Your video will be ready in ~2 minutes!

---

## Alternative: HeyGen (Also Easy)

If D-ID doesn't work:

1. Go to: https://www.heygen.com/
2. Sign up (free trial: 1 minute of video)
3. Get API key from: Settings > API
4. Add to .env as: `HEYGEN_API_KEY="your-key"`

---

## Alternative: Manual Creation (No API needed)

If you prefer to create manually:

1. **Use the script I generated** (already saved)
2. Go to: https://www.canva.com/
3. Create a video project (30 seconds)
4. Add text overlays with the script
5. Use stock footage/images
6. Export and done!

---

**Need Help?** Just paste your API key here and I'll integrate it immediately!
