<div dir="rtl" align="right">

# پروژه استادیار: دستیار هوشمند آموزشی برای هنرستان‌های فنی

## ۱. چشم‌انداز و معرفی پروژه

**استادیار** یک سیستم هوش مصنوعی ترکیبی (Compound AI System) است که با هدف توانمندسازی معلمان هنرستان‌های فنی و حرفه‌ای و کاردانش ایران طراحی شده است.  
این پلتفرم به معلمان در طراحی طرح درس‌های خلاقانه، فعالیت‌های کارگاهی، سوالات امتحانی استاندارد و به‌کارگیری روش‌های نوین تدریس کمک می‌کند.  
هدف اصلی، کاهش بار کاری معلمان و افزایش کیفیت و جذابیت آموزش‌های مهارتی برای هنرجویان است.

## ۲. قابلیت‌ها و ویژگی‌های کلیدی

- احراز هویت و پروفایل کاربری  
- شخصی‌سازی پویا  
- حافظه بلندمدت  
- پاسخ‌دهی مبتنی بر پایگاه دانش سفارشی‌شده (RAG)  
- جستجوی ترکیبی (Hybrid Search)  
- درک زمینه گفتگو (Contextual RAG)  
- مکانیزم بازخورد کاربر  
- رابط کاربری واکنش‌گرا  

## ۳. معماری سیستم

### لایه فرانت‌اند  
React + Marked.js

### لایه بک‌اند  
FastAPI + Python + Uvicorn + Pydantic + Passlib

### هسته هوش مصنوعی  
- پشتیبانی از Gemini، OpenAI، Ollama  
- خط لوله RAG با FAISS، BM25، RRF  

### لایه داده  
- SQLite برای داده‌های ساختاری  
- پایگاه دانش ایندکس‌شده با `faiss_index.bin`، `bm25_index.pkl` و `chunks.pkl`  

## ۴. پشته فناوری (Technology Stack)

| لایه         | ابزارها و کتابخانه‌ها                                         |
|--------------|----------------------------------------------------------------|
| Backend      | Python 3.10+، FastAPI، Uvicorn، Pydantic، Passlib               |
| Frontend     | HTML5، CSS3، JavaScript (ES6+)، Marked.js                      |
| هوش مصنوعی   | Gemini، OpenAI، Ollama، FAISS، BM25، PyPDF، LangChain           |
| پایگاه داده  | SQLite 3                                                       |
| مدیریت پروژه| Git، GitHub، Virtualenv                                        |

## ۵. راهنمای نصب و اجرا

```sh
# کلون کردن پروژه
git clone https://github.com/mfaxmodem/teacher_assistant.git
cd teacher_assistant

# ایجاد محیط مجازی و نصب پیش‌نیازها
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt

# تنظیم متغیرهای محیطی
cp .env.example .env
# مقداردهی کلیدهای API در فایل .env

# ساخت پایگاه دانش
python ingest.py

# اجرای بک‌اند
uvicorn main:app --reload

# اجرای فرانت‌اند
cd persian-chat-ui
pnpm install
pnpm dev


 ۶. نقشه راه و بهبودهای آینده
تحلیل بازخورد و بهینه‌سازی مدل

Fine-Tuning مدل بومی

افزودن توانایی پردازش تصاویر

بسته‌بندی با Docker و انتشار ابری

 ۷. مجوز (License)
این پروژه تحت مجوز MIT منتشر شده است. برای اطلاعات بیشتر به فایل LICENSE مراجعه شود.

۸. نحوه مشارکت (Contributing)
علاقه‌مندان به مشارکت می‌توانند فایل CONTRIBUTING.md را مطالعه کرده و Pull Request خود را ثبت نمایند.
</div>