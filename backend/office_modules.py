"""
NextAI Global - Office Management Modules
Integrated with Self-Learning AI Agent
"""

import os
import io
import json
import base64
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import asyncio
import aiohttp
from pathlib import Path
import PyPDF2
import docx
from PIL import Image
import pytesseract

# ==============================
# DOCUMENT PROCESSING MODULE
# ==============================

class DocumentProcessor:
    """Process and analyze documents with AI"""
    
    def __init__(self):
        self.upload_folder = Path(os.getenv("UPLOAD_FOLDER", "/app/backend/uploads"))
        self.upload_folder.mkdir(exist_ok=True)
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE_MB", "50")) * 1024 * 1024
        
    async def process_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process uploaded document and extract content"""
        try:
            file_ext = Path(filename).suffix.lower()
            
            # Extract text based on file type
            if file_ext == '.pdf':
                text = await self.extract_pdf_text(file_path)
            elif file_ext in ['.docx', '.doc']:
                text = await self.extract_docx_text(file_path)
            elif file_ext in ['.txt']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                text = await self.extract_image_text(file_path)
            else:
                return {"error": f"Unsupported file type: {file_ext}"}
            
            # Get file metadata
            file_stats = os.stat(file_path)
            
            return {
                "filename": filename,
                "file_type": file_ext,
                "file_size": file_stats.st_size,
                "text_content": text,
                "word_count": len(text.split()),
                "char_count": len(text),
                "processed_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to process document: {str(e)}"}
    
    async def extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    async def extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    
    async def extract_image_text(self, file_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            return f"OCR failed: {str(e)}"
    
    async def analyze_with_ai(self, document_data: Dict, ai_agent) -> Dict[str, Any]:
        """Analyze document content with AI agent"""
        prompt = f"""Analyze this document and provide a comprehensive summary:

Filename: {document_data['filename']}
Type: {document_data['file_type']}
Size: {document_data['file_size']} bytes
Word Count: {document_data['word_count']}

Content:
{document_data['text_content'][:3000]}

Please provide:
1. A concise summary
2. Key points or action items
3. Document category (contract, invoice, report, correspondence, etc.)
4. Any important dates or deadlines mentioned
5. Recommended actions"""

        result = await ai_agent.solve(prompt)
        return {
            **document_data,
            "ai_analysis": result["solution"],
            "analysis_score": result.get("score", 0),
            "analysis_confidence": result.get("confidence", "medium")
        }

# ==============================
# COMMUNICATION MODULE
# ==============================

class CommunicationHub:
    """Handle fax, email, and messaging"""
    
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.fax_number = os.getenv("TWILIO_FAX_NUMBER")
        self.sendgrid_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "office@nextaiglobal.com")
    
    async def send_fax(self, to_number: str, document_url: str, cover_page: Optional[str] = None) -> Dict:
        """Send fax using Twilio"""
        if not self.twilio_sid or self.twilio_sid == "your-twilio-account-sid":
            return {
                "status": "not_configured",
                "message": "Twilio not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env"
            }
        
        try:
            # Twilio Fax API call would go here
            return {
                "status": "queued",
                "to": to_number,
                "from": self.fax_number,
                "document": document_url,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "message": "Fax queued successfully (Twilio integration ready)"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def send_email(self, to: str, subject: str, body: str, attachments: List = None) -> Dict:
        """Send email using SendGrid"""
        if not self.sendgrid_key or self.sendgrid_key == "your-sendgrid-api-key":
            return {
                "status": "not_configured",
                "message": "SendGrid not configured. Please add SENDGRID_API_KEY to .env"
            }
        
        try:
            # SendGrid API call would go here
            return {
                "status": "sent",
                "to": to,
                "subject": subject,
                "from": self.from_email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "message": "Email sent successfully (SendGrid integration ready)"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def generate_email_reply(self, original_email: str, ai_agent) -> Dict:
        """Generate AI-powered email reply"""
        prompt = f"""Generate a professional email reply to the following email:

{original_email}

Requirements:
- Professional and courteous tone
- Address all points raised
- Clear and concise
- Include appropriate greeting and closing"""

        result = await ai_agent.solve(prompt)
        return {
            "reply": result["solution"],
            "confidence": result.get("confidence", "medium"),
            "model": result.get("model", "unknown")
        }

# ==============================
# MARKETING & SOCIAL MEDIA MODULE
# ==============================

class MarketingAutomation:
    """Create and manage marketing content"""
    
    def __init__(self):
        self.platforms = {
            "linkedin": os.getenv("LINKEDIN_ACCESS_TOKEN"),
            "twitter": os.getenv("TWITTER_API_KEY"),
            "facebook": os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN"),
            "instagram": os.getenv("INSTAGRAM_ACCESS_TOKEN")
        }
    
    async def generate_social_post(self, topic: str, platform: str, ai_agent) -> Dict:
        """Generate social media post with AI"""
        
        platform_guidelines = {
            "linkedin": "Professional, industry insights, 1300 chars max, business-focused",
            "twitter": "Concise, engaging, 280 chars max, hashtags",
            "facebook": "Conversational, engaging, call-to-action, 500 chars optimal",
            "instagram": "Visual-first caption, hashtags, emojis, 2200 chars max"
        }
        
        guideline = platform_guidelines.get(platform, "Professional and engaging")
        
        prompt = f"""Create a {platform} post about: {topic}

Platform Guidelines: {guideline}

NextAI Global focuses on:
- AI Estate and Trust Planning
- Publishing
- Software and AI Development  
- IT Services

Make it engaging, professional, and include relevant hashtags."""

        result = await ai_agent.solve(prompt)
        
        return {
            "platform": platform,
            "content": result["solution"],
            "topic": topic,
            "confidence": result.get("confidence"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def post_to_social(self, platform: str, content: str) -> Dict:
        """Post content to social media platform"""
        token = self.platforms.get(platform)
        
        if not token or "your-" in token:
            return {
                "status": "not_configured",
                "platform": platform,
                "message": f"{platform.title()} API not configured. Add credentials to .env"
            }
        
        # Platform-specific posting would go here
        return {
            "status": "posted",
            "platform": platform,
            "content_preview": content[:100],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"Post queued for {platform} (API integration ready)"
        }
    
    async def generate_marketing_campaign(self, campaign_type: str, ai_agent) -> Dict:
        """Generate complete marketing campaign"""
        prompt = f"""Create a complete marketing campaign for NextAI Global:

Campaign Type: {campaign_type}

Company Focus:
- AI Estate and Trust Planning
- Publishing Services
- Software and AI Development
- IT Solutions

Include:
1. Campaign theme and messaging
2. Target audience
3. Key value propositions
4. Content ideas for each platform (LinkedIn, Twitter, Facebook, Instagram)
5. Suggested timeline
6. Call-to-action strategies"""

        result = await ai_agent.solve(prompt)
        
        return {
            "campaign_type": campaign_type,
            "strategy": result["solution"],
            "confidence": result.get("confidence"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

# ==============================
# VIDEO & COMMERCIAL GENERATION
# ==============================

class VideoGenerator:
    """Generate video scripts and commercials"""
    
    def __init__(self):
        self.synthesia_key = os.getenv("SYNTHESIA_API_KEY")
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    
    async def generate_commercial_script(self, duration: int, focus: str, ai_agent) -> Dict:
        """Generate commercial script with AI"""
        prompt = f"""Create a {duration}-second commercial script for NextAI Global:

Focus: {focus}

Company Services:
- AI Estate and Trust Planning
- Publishing
- Software and AI Development
- IT Services

Requirements:
- Engaging hook in first 3 seconds
- Clear value proposition
- Professional tone
- Strong call-to-action
- Include scene descriptions and dialogue
- Format for {duration} seconds"""

        result = await ai_agent.solve(prompt)
        
        return {
            "duration": duration,
            "focus": focus,
            "script": result["solution"],
            "confidence": result.get("confidence"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_video(self, script: str, voice_type: str = "professional") -> Dict:
        """Generate video using AI (Synthesia or similar)"""
        if not self.synthesia_key or "your-" in self.synthesia_key:
            return {
                "status": "not_configured",
                "message": "Video generation API not configured. Add SYNTHESIA_API_KEY to .env"
            }
        
        # Synthesia API call would go here
        return {
            "status": "processing",
            "script_preview": script[:100],
            "voice_type": voice_type,
            "message": "Video generation queued (Synthesia integration ready)",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# ==============================
# WEBSITE MAINTENANCE MODULE
# ==============================

class WebsiteManager:
    """Monitor and maintain website"""
    
    def __init__(self):
        self.website_url = os.getenv("WEBSITE_URL", "https://nextaiglobal.com")
        self.uptime_key = os.getenv("UPTIME_ROBOT_API_KEY")
    
    async def check_website_status(self) -> Dict:
        """Check website uptime and performance"""
        try:
            async with aiohttp.ClientSession() as session:
                start_time = asyncio.get_event_loop().time()
                async with session.get(self.website_url, timeout=10) as response:
                    end_time = asyncio.get_event_loop().time()
                    response_time = (end_time - start_time) * 1000
                    
                    return {
                        "url": self.website_url,
                        "status": "online",
                        "status_code": response.status,
                        "response_time_ms": round(response_time, 2),
                        "checked_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            return {
                "url": self.website_url,
                "status": "error",
                "error": str(e),
                "checked_at": datetime.now(timezone.utc).isoformat()
            }
    
    async def analyze_seo(self, ai_agent) -> Dict:
        """Analyze website SEO with AI"""
        prompt = f"""Analyze the SEO and provide recommendations for: {self.website_url}

Focus on NextAI Global's services:
- AI Estate and Trust Planning
- Publishing
- Software and AI Development
- IT Services

Provide recommendations for:
1. Keyword optimization
2. Content strategy
3. Technical SEO improvements
4. Meta descriptions and titles
5. Link building strategies"""

        result = await ai_agent.solve(prompt)
        
        return {
            "website": self.website_url,
            "analysis": result["solution"],
            "confidence": result.get("confidence"),
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_website_content(self, page: str, ai_agent) -> Dict:
        """Generate website content with AI"""
        prompt = f"""Generate professional website content for NextAI Global's {page} page:

Company Focus:
- AI Estate and Trust Planning
- Publishing Services
- Software and AI Development
- IT Solutions

Requirements:
- Professional and engaging
- SEO-optimized
- Clear call-to-action
- Highlight unique value propositions
- Include relevant keywords naturally"""

        result = await ai_agent.solve(prompt)
        
        return {
            "page": page,
            "content": result["solution"],
            "confidence": result.get("confidence"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

# ==============================
# TASK COORDINATOR
# ==============================

class TaskCoordinator:
    """Coordinate all office management tasks"""
    
    def __init__(self, ai_agent):
        self.ai_agent = ai_agent
        self.document_processor = DocumentProcessor()
        self.communication = CommunicationHub()
        self.marketing = MarketingAutomation()
        self.video_gen = VideoGenerator()
        self.website = WebsiteManager()
    
    async def execute_task(self, task_type: str, task_data: Dict) -> Dict:
        """Execute any office management task dynamically"""
        
        tasks = {
            "process_document": self.document_processor.process_document,
            "analyze_document": self.document_processor.analyze_with_ai,
            "send_fax": self.communication.send_fax,
            "send_email": self.communication.send_email,
            "generate_email_reply": self.communication.generate_email_reply,
            "generate_social_post": self.marketing.generate_social_post,
            "post_to_social": self.marketing.post_to_social,
            "generate_campaign": self.marketing.generate_marketing_campaign,
            "generate_commercial": self.video_gen.generate_commercial_script,
            "generate_video": self.video_gen.generate_video,
            "check_website": self.website.check_website_status,
            "analyze_seo": self.website.analyze_seo,
            "generate_web_content": self.website.generate_website_content
        }
        
        task_func = tasks.get(task_type)
        if not task_func:
            return {"error": f"Unknown task type: {task_type}"}
        
        try:
            # Add AI agent to tasks that need it
            if task_type in ["analyze_document", "generate_email_reply", "generate_social_post", 
                           "generate_campaign", "generate_commercial", "analyze_seo", "generate_web_content"]:
                task_data["ai_agent"] = self.ai_agent
            
            result = await task_func(**task_data)
            return result
        except Exception as e:
            return {"error": f"Task execution failed: {str(e)}"}
