import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

// 训练数据API
export const trainingAPI = {
  // 获取训练数据
  getTrainingData: (params = {}) => api.get('/training/data', { params }),
  
  // 创建训练数据
  createTrainingData: (data) => api.post('/training/data', data),
  
  // 更新训练数据
  updateTrainingData: (id, data) => api.put(`/training/data/${id}`, data),
  
  // 删除训练数据
  deleteTrainingData: (id) => api.delete(`/training/data/${id}`),
  
  // 批量导入
  importTrainingData: (data) => api.post('/training/data/import', data),
  
  // 导出数据
  exportTrainingData: (format = 'json') => api.get('/training/data/export', { params: { format } }),
  
  // 意图管理
  getIntents: () => api.get('/training/intents'),
  createIntent: (data) => api.post('/training/intents', data),
  updateIntent: (id, data) => api.put(`/training/intents/${id}`, data),
  deleteIntent: (id) => api.delete(`/training/intents/${id}`),
  
  // 实体管理
  getEntities: () => api.get('/training/entities'),
  createEntity: (data) => api.post('/training/entities', data),
  updateEntity: (id, data) => api.put(`/training/entities/${id}`, data),
  deleteEntity: (id) => api.delete(`/training/entities/${id}`),
  
  // 统计信息
  getStatistics: () => api.get('/training/statistics'),
  validateData: () => api.get('/training/validate'),
};

// RASA模型API
export const rasaAPI = {
  // 模型管理
  getModels: () => api.get('/rasa/models'),
  getModel: (id) => api.get(`/rasa/models/${id}`),
  loadModel: (id) => api.post(`/rasa/models/${id}/load`),
  
  // 训练模型
  trainModel: (data) => api.post('/rasa/train', data),
  
  // 预测和测试
  predictIntent: (data) => api.post('/rasa/predict', data),
  processMessage: (data) => api.post('/rasa/process', data),
  testModel: (data) => api.post('/rasa/test', data),
  testSingle: (data) => api.post('/rasa/test/single', data),
  
  // 配置生成
  generateConfig: () => api.get('/rasa/config/generate'),
  generateTrainingData: () => api.get('/rasa/training-data/generate'),
  generateDomain: () => api.get('/rasa/domain/generate'),
  generateStories: () => api.get('/rasa/stories/generate'),
  
  // 状态
  getStatus: () => api.get('/rasa/status'),
};

// 大模型API
export const llmAPI = {
  // 配置管理
  getConfigs: () => api.get('/llm/configs'),
  createConfig: (data) => api.post('/llm/configs', data),
  updateConfig: (id, data) => api.put(`/llm/configs/${id}`, data),
  deleteConfig: (id) => api.delete(`/llm/configs/${id}`),
  toggleConfig: (id) => api.post(`/llm/configs/${id}/toggle`),
  
  // 测试
  testLLM: (data) => api.post('/llm/test', data),
  fallbackResponse: (data) => api.post('/llm/fallback', data),
  
  // 提供商
  getProviders: () => api.get('/llm/providers'),
  
  // 状态
  getStatus: () => api.get('/llm/status'),
  reloadConfigs: () => api.post('/llm/reload'),
};

// 设备API
export const deviceAPI = {
  // 设备管理
  getDevices: (params = {}) => api.get('/devices', { params }),
  getDevice: (id) => api.get(`/devices/${id}`),
  createDevice: (data) => api.post('/devices', data),
  updateDevice: (id, data) => api.put(`/devices/${id}`, data),
  deleteDevice: (id) => api.delete(`/devices/${id}`),
  
  // 设备控制
  controlDevice: (data) => api.post('/devices/control', data),
  controlDeviceById: (id, data) => api.post(`/devices/${id}/control`, data),
  
  // 设备信息
  getDeviceTypes: () => api.get('/devices/types'),
  getLocations: () => api.get('/devices/locations'),
  getStatistics: () => api.get('/devices/statistics'),
  
  // 初始化
  initializeDevices: () => api.post('/devices/initialize'),
};

// 对话API
export const chatAPI = {
  // 对话处理
  sendMessage: (data) => api.post('/chat/message', data),
  predictIntent: (data) => api.post('/chat/intent/predict', data),
  
  // 历史记录
  getHistory: (params = {}) => api.get('/chat/history', { params }),
  getSessions: () => api.get('/chat/sessions'),
  clearSession: (sessionId) => api.delete(`/chat/history/${sessionId}`),
  
  // 统计
  getStatistics: () => api.get('/chat/statistics'),
};

// 系统API
export const systemAPI = {
  // 健康检查
  healthCheck: () => api.get('/health'),
};

export default api;

