// API service for connecting to backend
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle streaming responses
      if (options.stream) {
        return response;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(userData) {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.mobile,
        password: userData.password,
        experience: parseInt(userData.teachingHistory) || 0,
        subject: userData.mainCourseTitle,
        field: userData.technicalField,
      }),
    });
  }

  async login(credentials) {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.mobile,
        password: credentials.password,
      }),
    });
  }

  // Conversation APIs
  async getConversations(userId) {
    return this.request(`/api/conversations/${userId}`);
  }

  async startConversation(userId, firstMessage) {
    return this.request('/api/start_conversation', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        first_message: firstMessage,
      }),
    });
  }

  async getMessages(conversationId, page = 1, limit = 20) {
    return this.request(`/api/messages/${conversationId}?page=${page}&limit=${limit}`);
  }

  async deleteConversation(conversationId, userId) {
    return this.request(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Chat API
  async sendMessage(conversationId, message) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message,
      }),
      stream: true,
    });
  }

  // Feedback API
  async sendFeedback(messageId, userId, rating) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message_id: messageId,
        user_id: userId,
        rating: rating,
      }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();

