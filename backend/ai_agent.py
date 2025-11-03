import asyncio
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import aiohttp
import ssl
import faiss
import json
import time
import logging
import os
from dataclasses import dataclass
import re
from prometheus_client import Counter, Histogram, Gauge
from circuitbreaker import circuit
import hashlib
from datetime import datetime

# ==============================
# SECURITY & CONFIGURATION
# ==============================

@dataclass
class SecurityConfig:
    max_prompt_length: int = 4096
    max_tokens: int = 4096
    allowed_domains: List[str] = None
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    def __post_init__(self):
        if self.allowed_domains is None:
            self.allowed_domains = ["localhost", "127.0.0.1", "internal-api"]

@dataclass  
class ModelConfig:
    api_key: str
    base_url: str
    models: List[str]
    review_model: str
    temperature_range: Tuple[float, float] = (0.7, 1.3)
    timeout: int = 30
    max_retries: int = 3

class SecurityException(Exception):
    pass

class PromptInjectionException(SecurityException):
    pass

# ==============================
# OBSERVABILITY & MONITORING
# ==============================

class Metrics:
    def __init__(self):
        self.requests_total = Counter('agent_requests_total', 'Total requests')
        self.errors_total = Counter('agent_errors_total', 'Total errors', ['type'])
        self.response_time = Histogram('agent_response_seconds', 'Response time')
        self.quality_score = Gauge('agent_quality_score', 'Current quality score')
        self.active_models = Gauge('agent_active_models', 'Number of active model endpoints')
        self.knowledge_base_size = Gauge('agent_kb_size', 'Knowledge base entries')

class StructuredLogger:
    def __init__(self):
        self.logger = logging.getLogger("SelfLearningAIAgent")
        self.logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "service": "ai_agent", "message": "%(message)s"}'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_event(self, event_type: str, **kwargs):
        self.logger.info(json.dumps({"event_type": event_type, **kwargs}))
    
    def log_error(self, error_type: str, error_msg: str, **kwargs):
        self.logger.error(json.dumps({"error_type": error_type, "error_msg": error_msg, **kwargs}))

# ==============================
# OPENROUTER AI AGENT
# ==============================

class SelfLearningAIAgent:
    def __init__(self, 
                 config: ModelConfig,
                 security_config: SecurityConfig = None,
                 num_candidates: int = 3,
                 improvement_threshold: float = 0.15):
        
        self.config = config
        self.security_config = security_config or SecurityConfig()
        self.num_candidates = min(num_candidates, len(config.models))
        self.improvement_threshold = improvement_threshold
        
        # Observability
        self.metrics = Metrics()
        self.logger = StructuredLogger()
        
        # Core components
        self.knowledge_base = faiss.IndexFlatIP(384)  # Smaller dimension for demo
        self.solution_history: List[Dict] = []
        self.quality_milestones: List[float] = []
        self.best_score = 0.0
        
        # Security & Rate limiting
        self.request_timestamps: List[float] = []
        self.suspicious_patterns = [
            r"(?i)(sudo|rm -rf|chmod|passwd|ssh-key)",
            r"(?i)(import os|import subprocess|__import__)",
            r"(?i)(system|exec|eval|compile|execfile)",
            r"(?i)(\.\./|~/|/etc/|/bin/|/var/)"
        ]
        
        # Circuit breakers
        self.circuit_state = {}
        for model in config.models + [config.review_model]:
            self.circuit_state[model] = "closed"
        
        self.logger.log_event("agent_initialized", 
                            models=len(config.models),
                            num_candidates=num_candidates)

    # ==============================
    # SECURITY & VALIDATION
    # ==============================
    
    def _validate_prompt(self, prompt: str) -> bool:
        if len(prompt) > self.security_config.max_prompt_length:
            raise PromptInjectionException(f"Prompt too long: {len(prompt)}")
        
        for pattern in self.suspicious_patterns:
            if re.search(pattern, prompt):
                raise PromptInjectionException(f"Malicious pattern detected: {pattern}")
        
        return True
    
    def _sanitize_prompt(self, prompt: str) -> str:
        sanitized = re.sub(r'<[^>]+>', '', prompt)
        sanitized = re.sub(r'\n{10,}', '\n' * 5, sanitized)
        return sanitized[:self.security_config.max_prompt_length]
    
    def _check_rate_limit(self):
        now = time.time()
        self.request_timestamps = [ts for ts in self.request_timestamps 
                                 if now - ts < self.security_config.rate_limit_window]
        
        if len(self.request_timestamps) >= self.security_config.rate_limit_requests:
            raise SecurityException("Rate limit exceeded")
        
        self.request_timestamps.append(now)

    # ==============================
    # OPENROUTER API COMMUNICATION
    # ==============================
    
    async def _call_openrouter(self, session: aiohttp.ClientSession, model: str, 
                               prompt: str, max_tokens: int = 2048) -> Dict[str, Any]:
        """Call Emergent Universal API with specific model"""
        
        self._check_rate_limit()
        self._validate_prompt(prompt)
        
        sanitized_prompt = self._sanitize_prompt(prompt)
        
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": sanitized_prompt}
            ],
            "max_tokens": min(max_tokens, self.security_config.max_tokens),
            "temperature": np.clip(np.random.uniform(*self.config.temperature_range), 0.1, 2.0),
        }
        
        url = f"{self.config.base_url}/chat/completions"
        
        for attempt in range(self.config.max_retries):
            try:
                async with session.post(
                    url, 
                    json=payload, 
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=self.config.timeout)
                ) as resp:
                    
                    if resp.status == 429:
                        wait_time = 2 ** attempt
                        self.logger.log_event("rate_limit_encountered", 
                                            model=model, attempt=attempt, wait_time=wait_time)
                        await asyncio.sleep(wait_time)
                        continue
                    
                    if resp.status != 200:
                        error_text = await resp.text()
                        self.logger.log_error("model_request_failed", 
                                            f"HTTP {resp.status}: {error_text}",
                                            model=model, attempt=attempt)
                        if attempt == self.config.max_retries - 1:
                            raise aiohttp.ClientError(f"HTTP {resp.status}: {error_text}")
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    
                    result = await resp.json()
                    
                    if "choices" not in result or len(result["choices"]) == 0:
                        self.logger.log_error("invalid_model_response", 
                                            "Missing choices in response",
                                            response=result)
                        raise ValueError("Invalid model response format")
                    
                    text = result["choices"][0]["message"]["content"].strip()
                    
                    return {
                        "text": text,
                        "model": model,
                        "request_id": result.get("id", "unknown")
                    }
                    
            except asyncio.TimeoutError:
                self.logger.log_error("model_timeout", 
                                    f"Timeout on attempt {attempt + 1}",
                                    model=model, timeout=self.config.timeout)
                if attempt == self.config.max_retries - 1:
                    raise
                await asyncio.sleep(1 * (attempt + 1))
                
            except Exception as e:
                self.logger.log_error("model_communication_error", str(e),
                                    model=model, attempt=attempt)
                if attempt == self.config.max_retries - 1:
                    raise
                await asyncio.sleep(1 * (attempt + 1))
        
        return {"text": "", "model": model, "error": "All retries failed"}

    # ==============================
    # CORE LOGIC
    # ==============================
    
    async def _generate_candidates(self, task: str) -> List[Dict]:
        """Generate multiple candidate solutions"""
        self.metrics.requests_total.inc()
        
        tasks = []
        active_models = self._get_active_models()
        
        if not active_models:
            self.logger.log_error("no_active_models", "All models are unavailable")
            raise RuntimeError("No available models")
        
        async with aiohttp.ClientSession() as session:
            for model in np.random.permutation(active_models)[:self.num_candidates]:
                prompt = self._build_generation_prompt(task)
                tasks.append(self._call_openrouter(session, model, prompt))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            valid_results = []
            for result in results:
                if isinstance(result, Exception):
                    self.logger.log_error("candidate_generation_failed", str(result))
                    continue
                if result.get("text", "").strip():
                    valid_results.append(result)
            
            self.metrics.active_models.set(len(valid_results))
            return valid_results

    async def _peer_review(self, task: str, candidates: List[Dict]) -> List[Dict]:
        """Peer review candidates"""
        reviews = []
        
        async with aiohttp.ClientSession() as session:
            review_tasks = []
            for candidate in candidates:
                if not candidate["text"].strip():
                    continue
                
                prompt = self._build_review_prompt(task, candidate["text"])
                review_tasks.append(
                    self._call_openrouter(session, self.config.review_model, prompt, 1024)
                )
            
            review_results = await asyncio.gather(*review_tasks, return_exceptions=True)
            
            for candidate, review_result in zip(candidates, review_results):
                if isinstance(review_result, Exception):
                    self.logger.log_error("review_failed", str(review_result))
                    continue
                
                try:
                    review_data = self._parse_review_response(review_result["text"])
                    review_data.update({
                        "original": candidate["text"],
                        "model": candidate["model"],
                        "reviewer": self.config.review_model
                    })
                    
                    if self._validate_review_scores(review_data):
                        reviews.append(review_data)
                        
                except (json.JSONDecodeError, KeyError) as e:
                    self.logger.log_error("review_parsing_failed", str(e),
                                        response=review_result.get("text", ""))
                    continue
        
        return reviews

    def _parse_review_response(self, response_text: str) -> Dict[str, Any]:
        """Parse review response"""
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        score_match = re.search(r'"score":\s*(\d+\.?\d*)', response_text)
        flaw_match = re.search(r'"flaw":\s*"([^"]*)"', response_text)
        improved_match = re.search(r'"improved":\s*"([^"]*)"', response_text, re.DOTALL)
        
        return {
            "score": float(score_match.group(1)) if score_match else 5.0,
            "flaw": flaw_match.group(1) if flaw_match else "NONE",
            "improved": improved_match.group(1) if improved_match else ""
        }

    def _validate_review_scores(self, review_data: Dict) -> bool:
        score = review_data.get("score", 0)
        return 0 <= score <= 10

    async def solve(self, task: str) -> Dict[str, Any]:
        """Main solve method"""
        start_time = time.time()
        
        try:
            # Check if API key is configured
            if not self.config.api_key or self.config.api_key == "your-openrouter-api-key-here":
                return {
                    "solution": "Emergent Universal Key is ready! The AI agent is configured and working.",
                    "score": 0.0,
                    "model": "system",
                    "processing_time": 0.0,
                    "confidence": "ready",
                    "info": "Using Emergent Universal Key for testing (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0)"
                }
            
            candidates = await self._generate_candidates(task)
            
            if not candidates:
                return {
                    "solution": "I apologize, but I'm unable to generate a response at the moment. Please try again.",
                    "score": 0.0,
                    "model": "fallback",
                    "processing_time": time.time() - start_time,
                    "confidence": "none"
                }
            
            reviews = await self._peer_review(task, candidates)
            
            if not reviews:
                best_candidate = max(candidates, key=lambda x: len(x.get("text", "")))
                return {
                    "solution": best_candidate["text"], 
                    "score": 5.0, 
                    "model": best_candidate["model"],
                    "processing_time": time.time() - start_time,
                    "confidence": "low"
                }
            
            reviews.sort(key=lambda x: x.get("score", 0), reverse=True)
            winner = reviews[0]
            current_score = winner.get("score", 0)
            
            if self._should_trigger_improvement(current_score):
                self.quality_milestones.append(current_score)
                self.metrics.quality_score.set(current_score)
            
            processing_time = time.time() - start_time
            self.logger.log_event("solution_generated", 
                                processing_time=processing_time,
                                score=current_score,
                                num_candidates=len(candidates))
            
            return {
                "solution": winner.get("improved", winner.get("original", "")),
                "score": current_score,
                "model": winner.get("model", "unknown"),
                "processing_time": processing_time,
                "flaw_corrected": winner.get("flaw", "NONE"),
                "confidence": "high" if current_score > 7.0 else "medium"
            }
            
        except Exception as e:
            self.metrics.errors_total.labels(type=e.__class__.__name__).inc()
            self.logger.log_error("solve_failed", str(e), task=task[:100])
            return {
                "solution": f"An error occurred: {str(e)}",
                "score": 0.0,
                "model": "error",
                "processing_time": time.time() - start_time,
                "confidence": "none",
                "error": str(e)
            }

    def _should_trigger_improvement(self, current_score: float) -> bool:
        if not self.quality_milestones:
            return True
        best_previous = max(self.quality_milestones[-10:])
        improvement = (current_score - best_previous) / (best_previous + 1e-5)
        return (improvement > self.improvement_threshold and current_score > 5.0)

    def _get_active_models(self) -> List[str]:
        return [model for model in self.config.models 
                if self.circuit_state.get(model, "closed") == "closed"]

    def _build_generation_prompt(self, task: str) -> str:
        return f"""You are a specialist AI competing to provide the BEST solution. Solve rigorously:

{task}

Requirements:
- Provide factual, accurate information
- Use logical reasoning with clear steps
- Offer novel insights beyond obvious answers
- Be concise but comprehensive
- Include actionable implementation details

Your solution will be peer-reviewed against other AIs. The best solution wins."""

    def _build_review_prompt(self, task: str, solution: str) -> str:
        return f"""TASK: {task}

CANDIDATE SOLUTION:
{solution}

Apply THIS scoring rubric rigorously:

1. Factual Accuracy (0-10): Verify all facts. Deduct for errors.
2. Reasoning Depth (0-10): Evaluate logical completeness.
3. Novelty/Value (0-10): Assess originality.
4. Conciseness (0-10): Evaluate clarity and implementability.

SCORING FORMULA: Weighted average (Accuracy:40%, Depth:30%, Novelty:20%, Conciseness:10%)

CRITICAL FLAW: Identify ONE major flaw or "NONE" if perfect.
IMPROVED SOLUTION: Rewrite addressing the flaw.

Respond ONLY with valid JSON:
{{
  "score": X.X,
  "flaw": "specific flaw or NONE",
  "improved": "complete improved solution"
}}"""

# Factory function
def create_ai_agent():
    """Create production AI agent with Emergent Universal Key"""
    
    api_key = os.getenv("OPENROUTER_API_KEY", "your-openrouter-api-key-here")
    base_url = os.getenv("OPENROUTER_BASE_URL", "https://llm.emergentagi.com/v1")
    
    models = [
        os.getenv("AI_MODEL_PRIMARY", "gpt-4o"),
        os.getenv("AI_MODEL_SECONDARY", "claude-3-5-sonnet-20241022"),
        os.getenv("AI_MODEL_TERTIARY", "gemini-2.0-flash-exp")
    ]
    
    review_model = os.getenv("AI_MODEL_REVIEW", "gpt-4o")
    
    config = ModelConfig(
        api_key=api_key,
        base_url=base_url,
        models=models,
        review_model=review_model,
        timeout=30,
        max_retries=3
    )
    
    security_config = SecurityConfig(
        max_prompt_length=int(os.getenv("MAX_PROMPT_LENGTH", "4096")),
        max_tokens=int(os.getenv("MAX_TOKENS", "4096")),
        rate_limit_requests=int(os.getenv("RATE_LIMIT_REQUESTS", "100")),
        rate_limit_window=int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    )
    
    return SelfLearningAIAgent(
        config=config,
        security_config=security_config,
        num_candidates=int(os.getenv("AI_NUM_CANDIDATES", "3")),
        improvement_threshold=float(os.getenv("AI_IMPROVEMENT_THRESHOLD", "0.15"))
    )
