"""
Simple AI Agent using Emergent Integrations
"""
import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

load_dotenv()

class SimpleAIAgent:
    """Simplified AI agent using Emergent Integrations"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY", "")
        self.chats = {}
        
    async def solve(self, message: str, session_id: str = "default") -> dict:
        """Get AI response"""
        
        if not self.api_key:
            return {
                "solution": "Emergent LLM key not configured. Please add EMERGENT_LLM_KEY to .env",
                "score": 0.0,
                "model": "system",
                "confidence": "none"
            }
        
        try:
            # Create or get chat session
            if session_id not in self.chats:
                self.chats[session_id] = LlmChat(
                    api_key=self.api_key,
                    session_id=session_id,
                    system_message="You are a helpful AI assistant for NextAI Global, specializing in estate planning, publishing, software development, and IT services."
                ).with_model("openai", "gpt-4o")
            
            chat = self.chats[session_id]
            
            # Send message
            user_msg = UserMessage(text=message)
            response = await chat.send_message(user_msg)
            
            return {
                "solution": response,
                "score": 9.0,
                "model": "gpt-4o",
                "confidence": "high",
                "processing_time": 0.0
            }
            
        except Exception as e:
            return {
                "solution": f"Error: {str(e)}",
                "score": 0.0,
                "model": "error",
                "confidence": "none"
            }

def create_ai_agent():
    """Create simple AI agent"""
    return SimpleAIAgent()
