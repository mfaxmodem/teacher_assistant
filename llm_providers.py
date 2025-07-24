import os
from abc import ABC, abstractmethod
import google.generativeai as genai
import ollama
import openai 
import numpy as np

# این کلاس، "قرارداد" یا "جایگاه استاندارد موتور" ماست
class LLMProvider(ABC):
    @abstractmethod
    def generate_stream(self, messages: list):
        pass

    @abstractmethod
    def create_embedding(self, text: str) -> list[float]:
        pass
    
    @abstractmethod
    def create_document_embeddings(self, chunks: list[str]) -> list[list[float]]:
        pass

# --- آداپتور برای Gemini API ---
class GeminiProvider(LLMProvider):
    # ... (این کلاس بدون تغییر باقی می‌ماند)
    def __init__(self, api_key: str, model_name: str = 'gemini-1.5-flash-latest', embedding_model: str = 'models/text-embedding-004'):
        genai.configure(api_key=api_key)
        self.model_name = model_name
        self.embedding_model = embedding_model
        print("✅ ارائه‌دهنده Gemini با موفقیت مقداردهی اولیه شد.")

    def generate_stream(self, messages: list):
        system_instruction = ""
        if messages and messages[0]['role'] == 'system':
            system_instruction = messages.pop(0)['content']
        model = genai.GenerativeModel(self.model_name, system_instruction=system_instruction)
        gemini_formatted_messages = []
        for msg in messages:
            role = 'model' if msg['role'] == 'assistant' else msg['role']
            gemini_formatted_messages.append({'role': role, 'parts': [{'text': msg['content']}]})
        stream = model.generate_content(gemini_formatted_messages, stream=True)
        for chunk in stream:
            if chunk.text: yield chunk.text

    def create_embedding(self, text: str) -> list[float]:
        result = genai.embed_content(model=self.embedding_model, content=text, task_type="RETRIEVAL_QUERY")
        return result["embedding"]
    
    def create_document_embeddings(self, chunks: list[str]) -> list[list[float]]:
        result = genai.embed_content(model=self.embedding_model, content=chunks, task_type="RETRIEVAL_DOCUMENT")
        return result["embedding"]

# --- آداپتور برای Ollama (مدل‌های محلی) ---
class OllamaProvider(LLMProvider):
    
    def __init__(self, model_name: str = 'llama3:8b-instruct', embedding_model: str = 'nomic-embed-text'):
        self.model = model_name
        self.embedding_model = embedding_model
        print("✅ ارائه‌دهنده Ollama با موفقیت مقداردهی اولیه شد.")

    def generate_stream(self, messages: list):
        stream = ollama.chat(model=self.model, messages=messages, stream=True)
        for chunk in stream:
            if chunk['message']['content']: yield chunk['message']['content']

    def create_embedding(self, text: str) -> list[float]:
        result = ollama.embed(model=self.embedding_model, prompt=text)
        return result["embedding"]
    
    def create_document_embeddings(self, chunks: list[str]) -> list[list[float]]:
        return [res["embedding"] for res in ollama.embed(model=self.embedding_model, prompts=chunks)]

# --- VVVV آداپتور جدید برای OpenAI API VVVV ---
class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = 'gpt-4o', embedding_model: str = 'text-embedding-3-small'):
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model_name
        self.embedding_model = embedding_model
        print("✅ ارائه‌دهنده OpenAI با موفقیت مقداردهی اولیه شد.")

    def generate_stream(self, messages: list):
        # OpenAI فرمت استاندارد پیام‌ها را مستقیم می‌فهمد
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=True
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def create_embedding(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            input=[text],
            model=self.embedding_model
        )
        return response.data[0].embedding
    
    def create_document_embeddings(self, chunks: list[str]) -> list[list[float]]:
        response = self.client.embeddings.create(
            input=chunks,
            model=self.embedding_model
        )
        return [item.embedding for item in response.data]

# --- تابع "کارخانه" (به‌روز شده) ---
def get_llm_provider():
    """
    متغیر محیطی AI_PROVIDER را خوانده و نمونه مناسب از ارائه‌دهنده را برمی‌گرداند.
    """
    provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
    
    if provider_name == "ollama":
        try:
            ollama.ps()
        except Exception:
            raise ConnectionError("نمی‌توان به سرور Ollama متصل شد. لطفاً مطمئن شوید در حال اجراست.")
        return OllamaProvider()
        
    # VVVV بخش جدید برای انتخاب OpenAI VVVV
    elif provider_name == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("برای استفاده از OpenAI، متغیر OPENAI_API_KEY باید تنظیم شود.")
        return OpenAIProvider(api_key=api_key)
    
    # به صورت پیش‌فرض از Gemini استفاده می‌کنیم
    elif provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("برای استفاده از Gemini، متغیر GEMINI_API_KEY باید تنظیم شود.")
        return GeminiProvider(api_key=api_key)
    
    else:
        raise ValueError(f"ارائه‌دهنده '{provider_name}' پشتیبانی نمی‌شود. لطفاً یکی از مقادیر 'gemini', 'openai', یا 'ollama' را انتخاب کنید.")