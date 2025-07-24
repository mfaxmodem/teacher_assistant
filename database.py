import sqlite3
import uuid
from passlib.context import CryptContext

DB_NAME = "teacher_assistant.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # جدول کاربران
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        experience INTEGER,
        subject TEXT,
        field TEXT
    )""")
    # جدول گفتگوها
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )""")
    # جدول پیام‌ها
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    )""")
    # جدول بازخورد
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL, -- 1 for good, -1 for bad
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )""")
    conn.commit()
    conn.close()
    print("✅ پایگاه داده SQLite با تمام جداول (شامل بازخورد) مقداردهی اولیه شد.")

def get_user(username: str):
    conn = sqlite3.connect(DB_NAME); conn.row_factory = sqlite3.Row
    cursor = conn.cursor(); cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone(); conn.close(); return user

def create_user(username, password, experience, subject, field):
    hashed_password = pwd_context.hash(password)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, hashed_password, experience, subject, field) VALUES (?, ?, ?, ?, ?)",(username, hashed_password, experience, subject, field))
        conn.commit(); user_id = cursor.lastrowid; conn.close(); return {"id": user_id, "username": username}
    except sqlite3.IntegrityError:
        conn.close(); return None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_conversation(user_id, title):
    conv_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor(); cursor.execute("INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)", (conv_id, user_id, title))
    conn.commit(); conn.close(); return conv_id

def get_user_conversations(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor(); cursor.execute("SELECT id, title FROM conversations WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    conversations = [{"id": row[0], "title": row[1]} for row in cursor.fetchall()]; conn.close(); return conversations

def get_user_by_conversation(conversation_id: str):
    conn = sqlite3.connect(DB_NAME); conn.row_factory = sqlite3.Row
    cursor = conn.cursor(); cursor.execute("""SELECT u.* FROM users u JOIN conversations c ON u.id = c.user_id WHERE c.id = ?""", (conversation_id,))
    user_info = cursor.fetchone(); conn.close(); return user_info

def delete_conversation(conversation_id: str, user_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
    if cursor.fetchone():
        cursor.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
        conn.commit(); conn.close(); return True
    conn.close(); return False

def add_message(conversation_id, role, content):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)", (conversation_id, role, content))
    message_id = cursor.lastrowid
    conn.commit(); conn.close()
    return message_id

def get_messages(conversation_id: str, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # خواندن پیام‌ها به همراه شناسه منحصر به فردشان
    cursor.execute(
        "SELECT id, role, content FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
        (conversation_id, limit, offset)
    )
    #  پیام‌ها به صورت معکوس (جدید به قدیم) خوانده می‌شوند
    messages = [{"id": row[0], "role": row[1], "content": row[2]} for row in cursor.fetchall()]
    conn.close()
    return messages[::-1] # لیست را برمی‌گردانیم تا ترتیب درست شود (قدیم به جدید)

def add_feedback(message_id, user_id, rating):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # برای جلوگیری از ثبت بازخورد تکراری 
    cursor.execute("DELETE FROM feedback WHERE message_id = ? AND user_id = ?", (message_id, user_id))
    cursor.execute("INSERT INTO feedback (message_id, user_id, rating) VALUES (?, ?, ?)", (message_id, user_id, rating))
    conn.commit(); conn.close()