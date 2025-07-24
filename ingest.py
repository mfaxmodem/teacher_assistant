# ingest.py - نسخه نهایی با ساخت ایندکس FAISS و BM25
import os
import pickle
import numpy as np
import faiss
from rank_bm25 import BM25Okapi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from dotenv import load_dotenv
from llm_providers import get_llm_provider

def main():
    print("--- شروع اسکریپت پردازش دانش (ingest.py) با FAISS و BM25 ---")
    load_dotenv()

    try:
        llm_provider = get_llm_provider()
    except (ValueError, ConnectionError) as e:
        print(f"❌ خطا در مقداردهی اولیه ارائه‌دهنده: {e}"); return

    KNOWLEDGE_BASE_DIR = "knowledge_base"
    
    # ... (بخش خواندن و تقسیم کردن PDF بدون تغییر) ...
    documents = []
    print(f"\nدر حال جستجو برای فایل‌های PDF در پوشه '{KNOWLEDGE_BASE_DIR}'...")
    if not os.path.exists(KNOWLEDGE_BASE_DIR) or not os.listdir(KNOWLEDGE_BASE_DIR):
        print(f"❌ خطا: پوشه '{KNOWLEDGE_BASE_DIR}' خالی است."); return
    for filename in os.listdir(KNOWLEDGE_BASE_DIR):
        if filename.endswith(".pdf"):
            try:
                reader = PdfReader(os.path.join(KNOWLEDGE_BASE_DIR, filename))
                for page in reader.pages:
                    text = page.extract_text()
                    if text: documents.append(text)
            except Exception as e:
                print(f"  - ⚠️ خطا در خواندن فایل {filename}: {e}")
    if not documents: print("❌ خطا: هیچ متنی از فایل‌های PDF استخراج نشد."); return
    print(f"✅ {len(documents)} صفحه با موفقیت خوانده شد.")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(" ".join(documents))
    print(f"✅ اسناد به {len(chunks)} تکه تقسیم شدند.")

    # --- ساخت ایندکس کلیدواژه‌ای BM25 ---
    print("\nدر حال ساخت ایندکس کلیدواژه‌ای BM25...")
    try:
        tokenized_chunks = [doc.split(" ") for doc in chunks]
        bm25_index = BM25Okapi(tokenized_chunks)
        with open("bm25_index.pkl", "wb") as f:
            pickle.dump(bm25_index, f)
        print("✅ ایندکس BM25 با موفقیت در فایل bm25_index.pkl ذخیره شد.")
    except Exception as e:
        print(f"❌ خطا در ساخت ایندکس BM25: {e}"); return
        
    # --- ساخت ایندکس برداری FAISS ---
    print("\nدر حال ساخت embedding برای تکه‌ها...")
    try:
        embeddings = llm_provider.create_document_embeddings(chunks)
        print("✅ Embedding با موفقیت ساخته شد.")
    except Exception as e:
        print(f"❌ خطا در ساخت embedding: {e}"); return
        
    print("\nدر حال ساخت و ذخیره‌سازی پایگاه داده FAISS...")
    try:
        embeddings_np = np.array(embeddings).astype('float32')
        index = faiss.IndexFlatL2(embeddings_np.shape[1])
        index.add(embeddings_np)
        faiss.write_index(index, "faiss_index.bin")
        with open("chunks.pkl", "wb") as f:
            pickle.dump(chunks, f)
        print("✅ پایگاه داده FAISS با موفقیت ذخیره شد.")
    except Exception as e:
        print(f"❌ خطا در ساخت یا ذخیره‌سازی FAISS: {e}")

if __name__ == "__main__":
    main()