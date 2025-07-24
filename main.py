import os
import pickle
import numpy as np
import faiss
import json
import logging
from logging.handlers import RotatingFileHandler
from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import database
import prompt_manager
from llm_providers import get_llm_provider

# --- ۱. راه‌اندازی سیستم لاگینگ ---
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s (%(filename)s:%(lineno)d)')
log_file = 'app.log'
file_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)
file_handler.setFormatter(log_formatter)
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# --- بارگذاری و تنظیمات اولیه ---
load_dotenv()
app = FastAPI()

@app.on_event("startup")
def startup_event():
    database.init_db()
    logger.info("Application startup complete. Database initialized.")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

try:
    llm_provider = get_llm_provider()
    logger.info(f"LLM Provider '{os.getenv('AI_PROVIDER', 'gemini').lower()}' initialized successfully.")
except (ValueError, ConnectionError) as e:
    logger.critical(f"Could not initialize LLM Provider: {e}", exc_info=True)
    exit()

try:
    index = faiss.read_index("faiss_index.bin")
    with open("chunks.pkl", "rb") as f: chunks = pickle.load(f)
    with open("bm25_index.pkl", "rb") as f: bm25_index = pickle.load(f)
    logger.info("FAISS and BM25 knowledge bases loaded successfully.")
except Exception as e:
    logger.error(f"Error loading knowledge bases: {e}", exc_info=True)
    index = None; bm25_index = None

# --- مدل‌های Pydantic ---
class UserCreate(BaseModel): username: str; password: str; experience: int; subject: str; field: str
class UserLogin(BaseModel): username: str; password: str
class NewConversationRequest(BaseModel): user_id: int; first_message: str
class ChatRequest(BaseModel): conversation_id: str; message: str
class FeedbackRequest(BaseModel): message_id: int; user_id: int; rating: int


app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_login_page():
    with open("static/login.html", encoding="utf-8") as f: return f.read()

@app.get("/app.html", response_class=HTMLResponse)
async def serve_app_page():
    with open("static/app.html", encoding="utf-8") as f: return f.read()

@app.get("/health")
async def health_check(): return {"status": "ok"}

# --- API های کاربران و گفتگوها ---
@app.post("/api/register")
async def register_user(user: UserCreate):
    db_user = database.get_user(user.username)
    if db_user: raise HTTPException(status_code=400, detail="نام کاربری تکراری است")
    new_user = database.create_user(user.username, user.password, user.experience, user.subject, user.field)
    return {"message": "کاربر با موفقیت ایجاد شد", "user": new_user}

@app.post("/api/login")
async def login_user(user: UserLogin):
    db_user = database.get_user(user.username)
    if not db_user or not database.verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")
    user_data = dict(db_user)
    user_data.pop("hashed_password")
    return {"message": "ورود موفقیت‌آمیز بود", "user": user_data}

@app.get("/api/conversations/{user_id}")
async def get_conversations(user_id: int):
    return database.get_user_conversations(user_id)

@app.post("/api/start_conversation")
async def start_conversation(request: NewConversationRequest):
    conv_id = database.create_conversation(request.user_id, request.first_message[:50])
    return {"conversation_id": conv_id}

@app.get("/api/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str, page: int = 1, limit: int = 20):
    return database.get_messages(conversation_id, page, limit)

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user_id: int = Body(..., embed=True)):
    success = database.delete_conversation(conversation_id, user_id)
    if not success: raise HTTPException(status_code=404, detail="گفتگو یافت نشد")
    return {"message": "گفتگو با موفقیت حذف شد"}

@app.post("/api/feedback")
async def handle_feedback(request: FeedbackRequest):
    database.add_feedback(request.message_id, request.user_id, request.rating)
    return {"message": "بازخورد شما با موفقیت ثبت شد."}

# --- API اصلی چت ---
@app.post("/api/chat")
async def chat_handler(request: ChatRequest):
    conversation_id = request.conversation_id
    user_message = request.message
    logger.info(f"Received new chat message for conversation_id: {conversation_id}")
    
    try:
        database.add_message(conversation_id, "user", user_message)
        history = database.get_messages(conversation_id, page=1, limit=10)
        user_info = database.get_user_by_conversation(conversation_id)
        if not user_info:
            raise HTTPException(status_code=404, detail="کاربر برای این گفتگو یافت نشد.")
        
       
        search_query = user_message # ...
        retrieved_context = "" # ...
        
        system_instruction = prompt_manager.create_system_instruction(dict(user_info))
        final_prompt_text = prompt_manager.create_final_prompt_with_context(user_message, retrieved_context)
        
        messages = [{"role": "system", "content": system_instruction}]
        for msg in history[:-1]:
            role = "assistant" if msg["role"] == "model" else msg["role"]
            messages.append({"role": role, "content": msg["content"]})
        messages.append({"role": "user", "content": final_prompt_text})

        async def response_generator():
            full_response = ""
            stream = llm_provider.generate_stream(messages)
            for chunk in stream:
                full_response += chunk
                yield chunk
            message_id = database.add_message(conversation_id, "model", full_response)
            yield f""
        
        return StreamingResponse(response_generator(), media_type="text/plain; charset=utf-8")
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.critical(f"An unhandled error occurred in chat_handler for conversation_id {conversation_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="یک خطای پیش‌بینی نشده در سرور رخ داد.")