#!/usr/bin/env python3
"""
Seed script to populate the database with sample data
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import random

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    """Seed the database with sample data"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Seeding database with sample data...")
    
    # Clear existing data
    print("Clearing existing data...")
    await db.customers.delete_many({})
    await db.sales.delete_many({})
    await db.refunds.delete_many({})
    await db.issues.delete_many({})
    await db.activities.delete_many({})
    
    # Sample customers
    customers = [
        {
            "id": str(uuid.uuid4()),
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-0101",
            "company": "Acme Corp",
            "status": "active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sarah Johnson",
            "email": "sarah.j@example.com",
            "phone": "+1-555-0102",
            "company": "TechStart Inc",
            "status": "active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Michael Brown",
            "email": "mbrown@example.com",
            "phone": "+1-555-0103",
            "company": "Global Services",
            "status": "active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emily Davis",
            "email": "emily.davis@example.com",
            "phone": "+1-555-0104",
            "company": "Design Studio",
            "status": "active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Robert Wilson",
            "email": "rwilson@example.com",
            "phone": "+1-555-0105",
            "company": "Enterprise Solutions",
            "status": "active",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
        }
    ]
    
    print(f"Creating {len(customers)} customers...")
    await db.customers.insert_many(customers)
    
    # Sample sales
    products = [
        "Dental Cleaning",
        "Teeth Whitening",
        "Root Canal",
        "Dental Implant",
        "Crown Replacement",
        "Orthodontic Treatment",
        "Cavity Filling",
        "Dental Checkup"
    ]
    
    sales = []
    for i in range(20):
        customer = random.choice(customers)
        sales.append({
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "product": random.choice(products),
            "amount": round(random.uniform(50, 1500), 2),
            "status": "completed",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
        })
    
    print(f"Creating {len(sales)} sales...")
    await db.sales.insert_many(sales)
    
    # Sample refunds
    refunds = []
    for i in range(3):
        sale = random.choice(sales[:5])
        refunds.append({
            "id": str(uuid.uuid4()),
            "sale_id": sale["id"],
            "customer_id": sale["customer_id"],
            "customer_name": sale["customer_name"],
            "amount": sale["amount"],
            "reason": random.choice([
                "Service not satisfactory",
                "Medical complication",
                "Scheduling conflict",
                "Insurance issue"
            ]),
            "status": random.choice(["pending", "approved", "pending"]),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 10))).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 10))).isoformat()
        })
    
    print(f"Creating {len(refunds)} refunds...")
    await db.refunds.insert_many(refunds)
    
    # Sample issues
    issues = [
        {
            "id": str(uuid.uuid4()),
            "title": "Billing discrepancy",
            "description": "Customer reported incorrect charges on invoice",
            "customer_id": customers[0]["id"],
            "customer_name": customers[0]["name"],
            "priority": "high",
            "status": "open",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Appointment rescheduling",
            "description": "Need to reschedule due to emergency",
            "customer_id": customers[1]["id"],
            "customer_name": customers[1]["name"],
            "priority": "medium",
            "status": "in_progress",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Insurance claim pending",
            "description": "Waiting for insurance approval",
            "customer_id": customers[2]["id"],
            "customer_name": customers[2]["name"],
            "priority": "low",
            "status": "open",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        }
    ]
    
    print(f"Creating {len(issues)} issues...")
    await db.issues.insert_many(issues)
    
    # Sample activities
    activities = []
    
    # Customer activities
    for customer in customers[:3]:
        activities.append({
            "id": str(uuid.uuid4()),
            "type": "customer",
            "action": "created",
            "description": f"New customer: {customer['name']}",
            "entity_id": customer["id"],
            "created_at": customer["created_at"]
        })
    
    # Sales activities
    for sale in sales[:5]:
        activities.append({
            "id": str(uuid.uuid4()),
            "type": "sale",
            "action": "created",
            "description": f"New sale: {sale['product']} for ${sale['amount']}",
            "entity_id": sale["id"],
            "created_at": sale["created_at"]
        })
    
    # Refund activities
    for refund in refunds:
        activities.append({
            "id": str(uuid.uuid4()),
            "type": "refund",
            "action": "created",
            "description": f"Refund request: ${refund['amount']}",
            "entity_id": refund["id"],
            "created_at": refund["created_at"]
        })
    
    # Issue activities
    for issue in issues:
        activities.append({
            "id": str(uuid.uuid4()),
            "type": "issue",
            "action": "created",
            "description": f"New issue: {issue['title']}",
            "entity_id": issue["id"],
            "created_at": issue["created_at"]
        })
    
    # Sort by date
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    
    print(f"Creating {len(activities)} activities...")
    await db.activities.insert_many(activities)
    
    # Summary
    print("\\n✅ Database seeded successfully!")
    print(f"   - {len(customers)} customers")
    print(f"   - {len(sales)} sales")
    print(f"   - {len(refunds)} refunds")
    print(f"   - {len(issues)} issues")
    print(f"   - {len(activities)} activities")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
