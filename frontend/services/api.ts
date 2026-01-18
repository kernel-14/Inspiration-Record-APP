/**
 * API Service for communicating with the backend
 */

// 自动检测 API 地址
// 支持本地开发、局域网访问和生产环境（Hugging Face/ModelScope）
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  const currentPort = window.location.port;
  
  // 生产环境检测（Hugging Face, ModelScope 等）
  // 这些平台通常使用 HTTPS 且前后端在同一域名
  if (currentHost.includes('hf.space') || 
      currentHost.includes('huggingface.co') || 
      currentHost.includes('modelscope.cn') ||
      currentHost.includes('gradio.live')) {
    // 使用相同的协议和域名，不指定端口
    return `${currentProtocol}//${currentHost}`;
  }
  
  // 局域网访问检测（如 192.168.x.x, 172.x.x.x）
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    // 后端始终使用 8000 端口
    return `${currentProtocol}//${currentHost}:8000`;
  }
  
  // 本地开发环境
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);


export interface ProcessResponse {
  record_id: string;
  timestamp: string;
  mood?: {
    type?: string;
    intensity?: number;
    keywords: string[];
  };
  inspirations: Array<{
    core_idea: string;
    tags: string[];
    category: string;
  }>;
  todos: Array<{
    task: string;
    time?: string;
    location?: string;
    status: string;
  }>;
  error?: string;
}

export interface RecordResponse {
  records: Array<{
    record_id: string;
    timestamp: string;
    input_type: 'audio' | 'text';
    original_text: string;
    parsed_data: {
      mood?: any;
      inspirations: any[];
      todos: any[];
    };
  }>;
}

export interface MoodResponse {
  moods: Array<{
    record_id: string;
    timestamp: string;
    type?: string;
    intensity?: number;
    keywords: string[];
  }>;
}

export interface InspirationResponse {
  inspirations: Array<{
    record_id: string;
    timestamp: string;
    core_idea: string;
    tags: string[];
    category: string;
  }>;
}

export interface TodoResponse {
  todos: Array<{
    record_id: string;
    timestamp: string;
    task: string;
    time?: string;
    location?: string;
    status: string;
  }>;
}

export interface UserConfigResponse {
  user_id: string;
  created_at: string;
  character: {
    image_url?: string;
    prompt?: string;
    revised_prompt?: string;
    preferences: {
      color: string;
      personality: string;
      appearance: string;
      role: string;
    };
    generated_at?: string;
    generation_count: number;
  };
  settings: {
    theme: string;
    language: string;
  };
}

class APIService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Process audio or text input
   */
  async processInput(audio?: File, text?: string): Promise<ProcessResponse> {
    try {
      console.log('📤 Processing input:', audio ? 'audio' : 'text');
      
      const formData = new FormData();
      
      if (audio) {
        formData.append('audio', audio);
      } else if (text) {
        formData.append('text', text);
      } else {
        throw new Error('Either audio or text must be provided');
      }

      const response = await fetch(`${this.baseUrl}/api/process`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(60000), // 60秒超时
      });

      console.log('📡 Process response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Process error:', error);
        throw new Error(error.error || 'Failed to process input');
      }

      const result = await response.json();
      console.log('✅ Process result:', result);
      return result;
    } catch (error) {
      console.error('❌ Process input error:', error);
      throw error;
    }
  }

  /**
   * Get all records
   */
  async getRecords(): Promise<RecordResponse> {
    const response = await fetch(`${this.baseUrl}/api/records`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }

    return response.json();
  }

  /**
   * Get all moods
   */
  async getMoods(): Promise<MoodResponse> {
    const response = await fetch(`${this.baseUrl}/api/moods`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch moods');
    }

    return response.json();
  }

  /**
   * Get all inspirations
   */
  async getInspirations(): Promise<InspirationResponse> {
    const response = await fetch(`${this.baseUrl}/api/inspirations`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch inspirations');
    }

    return response.json();
  }

  /**
   * Get all todos
   */
  async getTodos(): Promise<TodoResponse> {
    const response = await fetch(`${this.baseUrl}/api/todos`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return response.json();
  }

  /**
   * Update todo status
   */
  async updateTodoStatus(todoId: string, status: string): Promise<{ success: boolean }> {
    const formData = new FormData();
    formData.append('status', status);

    const response = await fetch(`${this.baseUrl}/api/todos/${todoId}`, {
      method: 'PATCH',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    return response.json();
  }

  /**
   * Get user configuration
   */
  async getUserConfig(): Promise<UserConfigResponse> {
    const response = await fetch(`${this.baseUrl}/api/user/config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user config');
    }

    return response.json();
  }

  /**
   * Chat with AI assistant
   */
  async chatWithAI(message: string): Promise<string> {
    try {
      console.log('🤖 Sending chat request to:', `${this.baseUrl}/api/chat`);
      console.log('📝 Message:', message);
      
      const formData = new FormData();
      formData.append('text', message);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        body: formData,
        mode: 'cors', // 明确指定 CORS 模式
        credentials: 'omit', // 不发送 cookies
        // 添加超时和错误处理
        signal: AbortSignal.timeout(60000), // 60秒超时
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chat API error:', response.status, errorText);
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Chat response received:', data);
      return data.response || '抱歉，我现在有点累了，稍后再聊好吗？';
    } catch (error) {
      console.error('❌ Chat error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          return '抱歉，网络有点慢，请稍后再试~';
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return '抱歉，无法连接到服务器，请检查网络连接~';
        }
      }
      return '抱歉，出现了一些问题，请稍后再试~';
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  /**
   * Generate character image
   */
  async generateCharacter(preferences: {
    color: string;
    personality: string;
    appearance: string;
    role: string;
  }): Promise<{
    success: boolean;
    image_url: string;
    prompt: string;
    preferences: any;
    task_id?: string;
  }> {
    const formData = new FormData();
    formData.append('color', preferences.color);
    formData.append('personality', preferences.personality);
    formData.append('appearance', preferences.appearance);
    formData.append('role', preferences.role);

    // 创建一个 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 秒超时

    try {
      const response = await fetch(`${this.baseUrl}/api/character/generate`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // 添加 keepalive 以保持连接
        keepalive: true,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.error || 'Failed to generate character');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('请求超时，图像生成时间较长，请稍后重试');
      }
      
      throw error;
    }
  }

  /**
   * Update character preferences
   */
  async updateCharacterPreferences(preferences: {
    color?: string;
    personality?: string;
    appearance?: string;
    role?: string;
  }): Promise<{ success: boolean; preferences: any }> {
    const formData = new FormData();
    if (preferences.color) formData.append('color', preferences.color);
    if (preferences.personality) formData.append('personality', preferences.personality);
    if (preferences.appearance) formData.append('appearance', preferences.appearance);
    if (preferences.role) formData.append('role', preferences.role);

    const response = await fetch(`${this.baseUrl}/api/character/preferences`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    return response.json();
  }

  /**
   * Get character history
   */
  async getCharacterHistory(): Promise<{
    images: Array<{
      filename: string;
      url: string;
      color: string;
      personality: string;
      timestamp: string;
      created_at: number;
      size: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/character/history`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch character history');
    }

    return response.json();
  }

  /**
   * Select a historical character image
   */
  async selectCharacter(filename: string): Promise<{
    success: boolean;
    image_url: string;
    filename: string;
    preferences: any;
  }> {
    const formData = new FormData();
    formData.append('filename', filename);

    const response = await fetch(`${this.baseUrl}/api/character/select`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to select character');
    }

    return response.json();
  }
}

export const apiService = new APIService();
