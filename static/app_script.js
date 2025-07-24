// static/app_script.js - Final Version

document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selectors ---
    const chatWindowWrapper = document.getElementById('chat-window-wrapper');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const conversationList = document.getElementById('conversation-list');
    const logoutBtn = document.getElementById('logout-btn');
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const usernameDisplay = document.getElementById('username-display');
    const loadingSpinner = document.getElementById('loading-spinner');

    // --- Application State ---
    let activeConversationId = null;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let currentPage = 1;
    let isLoadingMessages = false;
    let hasMoreMessages = true;

    if (!userInfo) {
        window.location.href = '/';
        return;
    }
    usernameDisplay.textContent = userInfo.username;

    // --- Sidebar UI Logic ---
    function openSidebar() {
        sidebar.classList.add('visible');
        overlay.classList.add('visible');
        overlay.classList.remove('hidden');
        menuBtn.classList.add('hidden');
        closeSidebarBtn.classList.remove('hidden');
    }
    function closeSidebar() {
        sidebar.classList.remove('visible');
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
        menuBtn.classList.remove('hidden');
        closeSidebarBtn.classList.add('hidden');
    }
    menuBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
    });

    // --- Conversation Management ---
    const loadConversations = async () => {
        try {
            const response = await fetch(`/api/conversations/${userInfo.id}`);
            const conversations = await response.json();
            conversationList.innerHTML = '';
            conversations.forEach(conv => {
                const div = document.createElement('div');
                div.className = 'conversation-item';
                div.dataset.id = conv.id;
                const titleSpan = document.createElement('span');
                titleSpan.textContent = conv.title;
                div.appendChild(titleSpan);
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`آیا از حذف گفتگوی "${conv.title}" مطمئن هستید؟`)) {
                        await deleteConversation(conv.id);
                    }
                });
                div.appendChild(deleteBtn);
                if (conv.id === activeConversationId) div.classList.add('active');
                div.addEventListener('click', () => setActiveConversation(conv.id));
                conversationList.appendChild(div);
            });
        } catch (error) { console.error('Error loading conversations:', error); }
    };

    const deleteConversation = async (convId) => {
        try {
            await fetch(`/api/conversations/${convId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userInfo.id })
            });
            if (convId === activeConversationId) newChatBtn.click();
            await loadConversations();
        } catch (error) { console.error('Error deleting conversation:', error); }
    };

    const setActiveConversation = async (convId) => {
        activeConversationId = convId;
        chatWindow.innerHTML = '';
        currentPage = 1;
        hasMoreMessages = true;
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === convId) item.classList.add('active');
        });
        closeSidebar();
        await loadMoreMessages();
    };

    const loadMoreMessages = async () => {
        if (isLoadingMessages || !hasMoreMessages || !activeConversationId) return;
        isLoadingMessages = true;
        loadingSpinner.classList.remove('hidden');
        try {
            const response = await fetch(`/api/messages/${activeConversationId}?page=${currentPage}&limit=20`);
            const messages = await response.json();
            if (messages.length < 20) { hasMoreMessages = false; }
            const oldScrollHeight = chatWindow.scrollHeight;
            messages.forEach(msg => {
                appendMessage(msg.content, msg.role === 'model' ? 'assistant' : 'user', false, msg.id, true);
            });
            if (currentPage > 1) {
                chatWindowWrapper.scrollTop = chatWindow.scrollHeight - oldScrollHeight;
            } else {
                chatWindowWrapper.scrollTop = chatWindow.scrollHeight;
            }
            currentPage++;
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            loadingSpinner.classList.add('hidden');
            isLoadingMessages = false;
        }
    };

    chatWindowWrapper.addEventListener('scroll', () => {
        if (chatWindowWrapper.scrollTop === 0) loadMoreMessages();
    });

    newChatBtn.addEventListener('click', () => {
        activeConversationId = null;
        chatWindow.innerHTML = '';
        currentPage = 1;
        hasMoreMessages = true;
        document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
        appendMessage('سلام! لطفاً اولین پیام خود را برای شروع یک گفتگوی جدید ارسال کنید.', 'assistant');
        closeSidebar();
    });

    const sendMessage = async () => {
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        appendMessage(messageText, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';
        let convIdToUse = activeConversationId;
        if (!convIdToUse) {
            try {
                const response = await fetch('/api/start_conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userInfo.id, first_message: messageText })
                });
                const data = await response.json();
                convIdToUse = data.conversation_id;
                activeConversationId = convIdToUse;
                await loadConversations();
            } catch (error) { console.error('Error starting new conversation:', error); return; }
        }
        const assistantMessageWrapper = appendMessage('', 'assistant', true);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation_id: convIdToUse, message: messageText })
            });
            const assistantMessageDiv = assistantMessageWrapper.querySelector('.message');
            assistantMessageDiv.innerHTML = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                fullResponseText += decoder.decode(value, { stream: true });
                assistantMessageDiv.innerHTML = marked.parse(fullResponseText);
                chatWindowWrapper.scrollTop = chatWindow.scrollHeight;
            }
            let messageId = null;
            const idRegex = /<!--ID:(\d+)-->/;
            const match = fullResponseText.match(idRegex);
            if (match) {
                messageId = parseInt(match[1], 10);
                const cleanText = fullResponseText.replace(idRegex, '');
                assistantMessageDiv.innerHTML = marked.parse(cleanText);
            }
            if (messageId) addFeedbackButtons(assistantMessageWrapper, messageId);
        } catch (error) {
            console.error('Fetch Error:', error);
            const assistantMessageDiv = assistantMessageWrapper.querySelector('.message');
            assistantMessageDiv.innerHTML = 'خطا در ارتباط با سرور.';
        }
    };

    function appendMessage(text, type, isTyping = false, messageId = null, isPrepending = false) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${type}-message-wrapper`;
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        if (isTyping) {
            messageDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        } else {
            messageDiv.innerHTML = marked.parse(text);
        }
        if (type === 'assistant') {
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = 'AI';
            messageContainer.appendChild(avatar);
        }
        messageContainer.appendChild(messageDiv);
        messageWrapper.appendChild(messageContainer);
        if (type === 'assistant' && messageId) addFeedbackButtons(messageWrapper, messageId);
        if (isPrepending) {
            chatWindow.prepend(messageWrapper);
        } else {
            chatWindow.appendChild(messageWrapper);
            chatWindowWrapper.scrollTop = chatWindow.scrollHeight;
        }
        return messageWrapper;
    }

    function addFeedbackButtons(messageWrapper, messageId) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-buttons';
        const thumbUp = document.createElement('button');
        thumbUp.className = 'feedback-btn';
        thumbUp.innerHTML = '👍';
        thumbUp.onclick = () => sendFeedback(messageId, 1, thumbUp);
        const thumbDown = document.createElement('button');
        thumbDown.className = 'feedback-btn';
        thumbDown.innerHTML = '👎';
        thumbDown.onclick = () => sendFeedback(messageId, -1, thumbDown);
        feedbackDiv.appendChild(thumbUp);
        feedbackDiv.appendChild(thumbDown);
        messageWrapper.appendChild(feedbackDiv);
    }

    async function sendFeedback(messageId, rating, buttonElement) {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message_id: messageId, user_id: userInfo.id, rating })
            });
            buttonElement.classList.toggle('selected');
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    await loadConversations();
});
