from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from ai_agent import create_ai_agent
from office_modules import TaskCoordinator, DocumentProcessor, CommunicationHub, MarketingAutomation, VideoGenerator, WebsiteManager
import asyncio
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize AI Agent
ai_agent = None
task_coordinator = None

# Create the main app
app = FastAPI(title="OfficeFlow AI API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# ==============================
# DATA MODELS
# ==============================

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str = "active"  # active, inactive
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None

class Sale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    product: str
    amount: float
    status: str = "completed"  # completed, pending, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SaleCreate(BaseModel):
    customer_id: str
    customer_name: str
    product: str
    amount: float
    status: Optional[str] = "completed"

class Refund(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sale_id: str
    customer_id: str
    customer_name: str
    amount: float
    reason: str
    status: str = "pending"  # pending, approved, rejected, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RefundCreate(BaseModel):
    sale_id: str
    customer_id: str
    customer_name: str
    amount: float
    reason: str

class RefundUpdate(BaseModel):
    status: str

class Issue(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    status: str = "open"  # open, in_progress, resolved, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IssueCreate(BaseModel):
    title: str
    description: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    priority: Optional[str] = "medium"

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    response: str
    score: Optional[float] = None
    model: Optional[str] = None
    confidence: Optional[str] = None
    processing_time: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # customer, sale, refund, issue, chat
    action: str  # created, updated, completed, etc
    description: str
    entity_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    total_customers: int
    new_customers_this_month: int
    pending_refunds: int
    refunds_requiring_attention: int
    open_issues: int
    issues_needing_review: int
    total_revenue_30_days: float
    revenue_by_product: List[dict]
    recent_activities: List[Activity]

# ==============================
# HELPER FUNCTIONS
# ==============================

def serialize_datetime(obj):
    """Convert datetime to ISO string for MongoDB"""
    if isinstance(obj, dict):
        return {k: serialize_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_datetime(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def deserialize_datetime(obj):
    """Convert ISO string back to datetime"""
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            if k in ['created_at', 'updated_at'] and isinstance(v, str):
                result[k] = datetime.fromisoformat(v)
            else:
                result[k] = deserialize_datetime(v)
        return result
    elif isinstance(obj, list):
        return [deserialize_datetime(item) for item in obj]
    return obj

async def log_activity(type: str, action: str, description: str, entity_id: Optional[str] = None):
    """Log an activity"""
    activity = Activity(
        type=type,
        action=action,
        description=description,
        entity_id=entity_id
    )
    doc = serialize_datetime(activity.model_dump())
    await db.activities.insert_one(doc)

# ==============================
# ROUTES - CUSTOMERS
# ==============================

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(c) for c in customers]

@api_router.post("/customers", response_model=Customer)
async def create_customer(input: CustomerCreate):
    customer = Customer(**input.model_dump())
    doc = serialize_datetime(customer.model_dump())
    await db.customers.insert_one(doc)
    await log_activity("customer", "created", f"New customer: {customer.name}", customer.id)
    return customer

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return deserialize_datetime(customer)

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, input: CustomerUpdate):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": serialize_datetime(update_data)}
    )
    
    updated_customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    await log_activity("customer", "updated", f"Updated customer: {updated_customer['name']}", customer_id)
    return deserialize_datetime(updated_customer)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    await log_activity("customer", "deleted", f"Deleted customer ID: {customer_id}", customer_id)
    return {"message": "Customer deleted successfully"}

# ==============================
# ROUTES - SALES
# ==============================

@api_router.get("/sales", response_model=List[Sale])
async def get_sales():
    sales = await db.sales.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(s) for s in sales]

@api_router.post("/sales", response_model=Sale)
async def create_sale(input: SaleCreate):
    sale = Sale(**input.model_dump())
    doc = serialize_datetime(sale.model_dump())
    await db.sales.insert_one(doc)
    await log_activity("sale", "created", f"New sale: {sale.product} for ${sale.amount}", sale.id)
    return sale

@api_router.get("/sales/{sale_id}", response_model=Sale)
async def get_sale(sale_id: str):
    sale = await db.sales.find_one({"id": sale_id}, {"_id": 0})
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return deserialize_datetime(sale)

# ==============================
# ROUTES - REFUNDS
# ==============================

@api_router.get("/refunds", response_model=List[Refund])
async def get_refunds():
    refunds = await db.refunds.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(r) for r in refunds]

@api_router.post("/refunds", response_model=Refund)
async def create_refund(input: RefundCreate):
    refund = Refund(**input.model_dump())
    doc = serialize_datetime(refund.model_dump())
    await db.refunds.insert_one(doc)
    await log_activity("refund", "created", f"New refund request: ${refund.amount}", refund.id)
    return refund

@api_router.put("/refunds/{refund_id}", response_model=Refund)
async def update_refund(refund_id: str, input: RefundUpdate):
    refund = await db.refunds.find_one({"id": refund_id}, {"_id": 0})
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found")
    
    update_data = input.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.refunds.update_one(
        {"id": refund_id},
        {"$set": serialize_datetime(update_data)}
    )
    
    updated_refund = await db.refunds.find_one({"id": refund_id}, {"_id": 0})
    await log_activity("refund", "updated", f"Refund status changed to: {input.status}", refund_id)
    return deserialize_datetime(updated_refund)

# ==============================
# ROUTES - ISSUES
# ==============================

@api_router.get("/issues", response_model=List[Issue])
async def get_issues():
    issues = await db.issues.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(i) for i in issues]

@api_router.post("/issues", response_model=Issue)
async def create_issue(input: IssueCreate):
    issue = Issue(**input.model_dump())
    doc = serialize_datetime(issue.model_dump())
    await db.issues.insert_one(doc)
    await log_activity("issue", "created", f"New issue: {issue.title}", issue.id)
    return issue

@api_router.put("/issues/{issue_id}", response_model=Issue)
async def update_issue(issue_id: str, input: IssueUpdate):
    issue = await db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.issues.update_one(
        {"id": issue_id},
        {"$set": serialize_datetime(update_data)}
    )
    
    updated_issue = await db.issues.find_one({"id": issue_id}, {"_id": 0})
    await log_activity("issue", "updated", f"Issue updated: {updated_issue['title']}", issue_id)
    return deserialize_datetime(updated_issue)

# ==============================
# ROUTES - AI AGENT CHAT
# ==============================

@api_router.post("/chat", response_model=ChatMessage)
async def chat_with_agent(input: ChatRequest):
    global ai_agent, task_coordinator
    
    if ai_agent is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    # Get AI response
    result = await ai_agent.solve(input.message)
    
    # Create chat message record
    chat_message = ChatMessage(
        message=input.message,
        response=result["solution"],
        score=result.get("score"),
        model=result.get("model"),
        confidence=result.get("confidence"),
        processing_time=result.get("processing_time")
    )
    
    doc = serialize_datetime(chat_message.model_dump())
    await db.chat_messages.insert_one(doc)
    await log_activity("chat", "message", f"AI Chat: {input.message[:50]}...", chat_message.id)
    
    return chat_message

@api_router.get("/chat/history", response_model=List[ChatMessage])
async def get_chat_history():
    messages = await db.chat_messages.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return [deserialize_datetime(m) for m in messages]

# ==============================
# ROUTES - DOCUMENT MANAGEMENT
# ==============================

class DocumentAnalysis(BaseModel):
    filename: str
    file_type: str
    file_size: int
    text_content: str
    word_count: int
    char_count: int
    ai_analysis: Optional[str] = None
    analysis_score: Optional[float] = None
    analysis_confidence: Optional[str] = None
    processed_at: str

@api_router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process document"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    try:
        # Save uploaded file
        upload_folder = Path("/app/backend/uploads")
        upload_folder.mkdir(exist_ok=True)
        
        file_id = str(uuid.uuid4())
        file_path = upload_folder / f"{file_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        result = await task_coordinator.document_processor.process_document(
            str(file_path), 
            file.filename
        )
        
        if "error" in result:
            return {"status": "error", "message": result["error"]}
        
        # Analyze with AI
        analysis = await task_coordinator.document_processor.analyze_with_ai(result, task_coordinator.ai_agent)
        
        # Store in database
        doc_record = {
            "id": file_id,
            "file_path": str(file_path),
            **analysis,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.documents.insert_one(doc_record)
        await log_activity("document", "uploaded", f"Document uploaded: {file.filename}", file_id)
        
        return {
            "status": "success",
            "document_id": file_id,
            "analysis": analysis
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@api_router.get("/documents")
async def get_documents():
    """Get all uploaded documents"""
    docs = await db.documents.find({}, {"_id": 0, "text_content": 0}).sort("uploaded_at", -1).to_list(100)
    return docs

@api_router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get specific document with full analysis"""
    doc = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

# ==============================
# ROUTES - COMMUNICATION
# ==============================

class FaxRequest(BaseModel):
    to_number: str
    document_id: str
    cover_page: Optional[str] = None

class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class EmailReplyRequest(BaseModel):
    original_email: str

@api_router.post("/communication/fax")
async def send_fax(request: FaxRequest):
    """Send fax"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    # Get document
    doc = await db.documents.find_one({"id": request.document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    result = await task_coordinator.communication.send_fax(
        request.to_number,
        doc["file_path"],
        request.cover_page
    )
    
    await log_activity("fax", "sent", f"Fax sent to {request.to_number}")
    return result

@api_router.post("/communication/email")
async def send_email(request: EmailRequest):
    """Send email"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.communication.send_email(
        request.to,
        request.subject,
        request.body
    )
    
    await log_activity("email", "sent", f"Email sent to {request.to}")
    return result

@api_router.post("/communication/email/reply")
async def generate_email_reply(request: EmailReplyRequest):
    """Generate AI email reply"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.communication.generate_email_reply(
        request.original_email,
        task_coordinator.ai_agent
    )
    
    return result

# ==============================
# ROUTES - MARKETING & SOCIAL MEDIA
# ==============================

class SocialPostRequest(BaseModel):
    topic: str
    platform: str  # linkedin, twitter, facebook, instagram

class PostToSocialRequest(BaseModel):
    platform: str
    content: str

class MarketingCampaignRequest(BaseModel):
    campaign_type: str

@api_router.post("/marketing/generate-post")
async def generate_social_post(request: SocialPostRequest):
    """Generate social media post"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.marketing.generate_social_post(
        request.topic,
        request.platform,
        task_coordinator.ai_agent
    )
    
    # Store in database
    post_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.social_posts.insert_one(post_record)
    await log_activity("marketing", "created", f"{request.platform} post generated")
    
    return result

@api_router.post("/marketing/post")
async def post_to_social(request: PostToSocialRequest):
    """Post content to social media"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.marketing.post_to_social(
        request.platform,
        request.content
    )
    
    await log_activity("marketing", "posted", f"Posted to {request.platform}")
    return result

@api_router.post("/marketing/campaign")
async def generate_marketing_campaign(request: MarketingCampaignRequest):
    """Generate complete marketing campaign"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.marketing.generate_marketing_campaign(
        request.campaign_type,
        task_coordinator.ai_agent
    )
    
    # Store in database
    campaign_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.marketing_campaigns.insert_one(campaign_record)
    await log_activity("marketing", "campaign_created", f"Campaign created: {request.campaign_type}")
    
    return result

@api_router.get("/marketing/posts")
async def get_social_posts():
    """Get all generated social posts"""
    posts = await db.social_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/marketing/campaigns")
async def get_campaigns():
    """Get all marketing campaigns"""
    campaigns = await db.marketing_campaigns.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return campaigns

# ==============================
# ROUTES - VIDEO & COMMERCIALS
# ==============================

class CommercialRequest(BaseModel):
    duration: int  # seconds
    focus: str

class VideoGenerationRequest(BaseModel):
    script: str
    voice_type: Optional[str] = "professional"

@api_router.post("/video/generate-script")
async def generate_commercial_script(request: CommercialRequest):
    """Generate commercial script"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.video_gen.generate_commercial_script(
        request.duration,
        request.focus,
        task_coordinator.ai_agent
    )
    
    # Store in database
    script_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.video_scripts.insert_one(script_record)
    await log_activity("video", "script_created", f"{request.duration}s commercial script generated")
    
    return result

@api_router.post("/video/generate")
async def generate_video(request: VideoGenerationRequest):
    """Generate video from script"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.video_gen.generate_video(
        request.script,
        request.voice_type
    )
    
    await log_activity("video", "generated", "Video generation queued")
    return result

@api_router.get("/video/scripts")
async def get_video_scripts():
    """Get all video scripts"""
    scripts = await db.video_scripts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return scripts

# ==============================
# ROUTES - WEBSITE MANAGEMENT
# ==============================

class WebContentRequest(BaseModel):
    page: str

@api_router.get("/website/status")
async def check_website_status():
    """Check website status and performance"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.website.check_website_status()
    
    # Store in database
    status_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.website_checks.insert_one(status_record)
    
    return result

@api_router.get("/website/seo-analysis")
async def analyze_website_seo():
    """Analyze website SEO"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.website.analyze_seo(task_coordinator.ai_agent)
    
    # Store in database
    seo_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.seo_analyses.insert_one(seo_record)
    await log_activity("website", "seo_analyzed", "SEO analysis completed")
    
    return result

@api_router.post("/website/generate-content")
async def generate_website_content(request: WebContentRequest):
    """Generate website content"""
    global task_coordinator
    
    if task_coordinator is None:
        ai_agent = create_ai_agent()
        task_coordinator = TaskCoordinator(ai_agent)
    
    result = await task_coordinator.website.generate_website_content(
        request.page,
        task_coordinator.ai_agent
    )
    
    # Store in database
    content_record = {
        "id": str(uuid.uuid4()),
        **result
    }
    await db.web_content.insert_one(content_record)
    await log_activity("website", "content_generated", f"Content generated for {request.page}")
    
    return result

@api_router.get("/website/history")
async def get_website_checks():
    """Get website check history"""
    checks = await db.website_checks.find({}, {"_id": 0}).sort("checked_at", -1).limit(50).to_list(50)
    return checks

# ==============================
# ROUTES - DASHBOARD
# ==============================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    # Get date 30 days ago
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Total customers
    total_customers = await db.customers.count_documents({"status": "active"})
    
    # New customers this month
    new_customers = await db.customers.count_documents({
        "created_at": {"$gte": one_month_ago.isoformat()}
    })
    
    # Pending refunds
    pending_refunds = await db.refunds.count_documents({"status": "pending"})
    
    # Open issues
    open_issues = await db.issues.count_documents({"status": {"$in": ["open", "in_progress"]}})
    
    # Revenue last 30 days
    sales_pipeline = [
        {"$match": {
            "created_at": {"$gte": thirty_days_ago.isoformat()},
            "status": "completed"
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.sales.aggregate(sales_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0
    
    # Revenue by product
    product_pipeline = [
        {"$match": {
            "created_at": {"$gte": thirty_days_ago.isoformat()},
            "status": "completed"
        }},
        {"$group": {
            "_id": "$product",
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"revenue": -1}},
        {"$limit": 10}
    ]
    product_results = await db.sales.aggregate(product_pipeline).to_list(10)
    revenue_by_product = [
        {"product": r["_id"], "revenue": r["revenue"], "count": r["count"]}
        for r in product_results
    ]
    
    # Recent activities
    activities = await db.activities.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_activities = [Activity(**deserialize_datetime(a)) for a in activities]
    
    return DashboardStats(
        total_customers=total_customers,
        new_customers_this_month=new_customers,
        pending_refunds=pending_refunds,
        refunds_requiring_attention=pending_refunds,
        open_issues=open_issues,
        issues_needing_review=open_issues,
        total_revenue_30_days=total_revenue,
        revenue_by_product=revenue_by_product,
        recent_activities=recent_activities
    )

# ==============================
# HEALTH CHECK
# ==============================

@api_router.get("/")
async def root():
    return {"message": "OfficeFlow AI API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_agent": "ready" if ai_agent else "not initialized"
    }

# Include router in app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
