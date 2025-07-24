// static/script.js - نسخه نهایی و صحیح با حافظه بلندمدت
document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("info-modal-overlay");
    const startChatBtn = document.getElementById("start-chat-btn");
    const experienceInput = document.getElementById("experience-input");
    const subjectInput = document.getElementById("subject-input");
    const fieldInput = document.getElementById("field-input");
    const modalError = document.getElementById("modal-error");
    const chatContainer = document.getElementById("chat-container");
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    let conversationId = null; // متغیری برای نگهداری شناسه گفتگو

    // --- منطق مودال برای شروع گفتگو ---
    startChatBtn.addEventListener("click", async () => {
        const experience = parseInt(experienceInput.value, 10);
        const subject = subjectInput.value.trim();
        const field = fieldInput.value.trim();

        // اعتبارسنجی ورودی
        if (isNaN(experience) || experience < 0 || experience > 45) {
            modalError.textContent = "لطفاً سابقه تدریس را به صورت یک عدد معتبر (بین ۰ تا ۴۵) وارد کنید.";
            return;
        }
        if (subject.length < 3) {
            modalError.textContent = "لطفاً عنوان درس را به درستی وارد کنید.";
            return;
        }
        if (field.length < 3) {
            modalError.textContent = "لطفاً رشته فنی را به درستی وارد کنید.";
            return;
        }

        try {
            // ۱. ارسال درخواست برای شروع گفتگو و دریافت شناسه
            const response = await fetch("/api/start_conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ experience, subject, field }),
            });
            
            if (!response.ok) {
                throw new Error("Server responded with an error.");
            }

            const data = await response.json();
            if (data.conversation_id) {
                conversationId = data.conversation_id; // ۲. ذخیره شناسه
                
                // ۳. شروع چت
                modalError.textContent = "";
                modalOverlay.classList.add("hidden");
                chatContainer.classList.remove("hidden");
                chatInput.disabled = false;
                sendBtn.disabled = false;
                appendMessage("سلام! من دستیار هوشمند شما هستم. چطور می‌توانم در طراحی محتوای درسی کمکتان کنم؟", "assistant");
            } else {
                modalError.textContent = "خطا در دریافت شناسه گفتگو از سرور.";
            }
        } catch (error) {
            modalError.textContent = "خطای شبکه در هنگام شروع گفتگو.";
            console.error("Error starting conversation:", error);
        }
    });

    // --- منطق ارسال پیام (به‌روز شده) ---
    const sendMessage = async () => {
        const messageText = chatInput.value.trim();
        if (messageText === "" || !conversationId) return;

        appendMessage(messageText, "user");
        chatInput.value = "";
        
        // در این نسخه، تاریخچه را از سرور می‌خوانیم، پس نیازی به ارسال آن از اینجا نیست
        // let conversationHistory = []; // این خط دیگر نیاز نیست

        const assistantMessageDiv = document.createElement("div");
        assistantMessageDiv.className = "message assistant-message";
        chatWindow.appendChild(assistantMessageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            // ارسال درخواست به همراه شناسه گفتگو و پیام جدید
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: messageText,
                }),
            });
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                fullResponseText += chunk;
                assistantMessageDiv.textContent = fullResponseText;
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }

            if (!response.ok) {
                 assistantMessageDiv.style.backgroundColor = "#ffdddd";
                 assistantMessageDiv.style.color = "red";
            }

        } catch (error) {
            assistantMessageDiv.textContent = "خطای غیرمنتظره شبکه. لطفاً کنسول مرورگر را چک کنید.";
            assistantMessageDiv.style.backgroundColor = "#ffdddd";
            assistantMessageDiv.style.color = "red";
            console.error("Fetch Error:", error);
        }
    };

    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function appendMessage(text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${type}-message`; // 'assistant' for model responses
        messageDiv.textContent = text;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});