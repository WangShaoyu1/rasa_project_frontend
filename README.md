# 智能家居语音交互系统 - 前端管理后台

[![React](https://img.shields.io/badge/react-19.0-blue.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/vite-6.0-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.4-blue.svg)](https://tailwindcss.com)

基于React 19的现代化智能家居语音交互系统管理后台，提供完整的训练数据管理、模型训练、设备控制和对话测试功能。

## ✨ 功能特性

- 🎯 **概览仪表板** - 系统状态总览和关键指标监控
- 📝 **训练数据管理** - 数据上传、标注、导入导出
- 🤖 **RASA模型管理** - 模型训练、测试、版本管理
- 🧠 **大模型配置** - 多厂商大模型接入配置
- 🏠 **设备管理** - 智能设备控制和状态监控
- 💬 **对话测试** - 实时交互测试和分析

## 🛠️ 技术栈

- **框架**: React 19
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 3.4
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **路由**: React Router DOM
- **HTTP客户端**: Axios
- **状态管理**: React Hooks

## 🚀 快速开始

### 环境要求

- Node.js 18+ (推荐 20.x)
- pnpm 8+ (推荐使用pnpm)

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install

# 或使用npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 或使用npm
npm run dev
```

访问 http://localhost:5173 查看应用

### 生产构建

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件配置环境变量：

```bash
# API配置
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws

# 应用配置
VITE_APP_TITLE=智能家居语音交互系统
VITE_APP_VERSION=1.0.0
```

### API集成

前端通过RESTful API与后端服务通信：

```javascript
// API客户端配置
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # shadcn/ui组件
│   └── Layout.jsx      # 主布局组件
├── pages/              # 页面组件
│   ├── Dashboard.jsx   # 仪表板
│   ├── training/       # 训练数据管理
│   ├── rasa/          # RASA模型管理
│   ├── llm/           # 大模型配置
│   ├── devices/       # 设备管理
│   └── chat/          # 对话测试
├── lib/               # 工具库
│   ├── api.js         # API客户端
│   └── utils.js       # 工具函数
├── App.jsx            # 应用入口
└── main.jsx           # 主入口文件
```

## 🎨 UI组件

项目使用 [shadcn/ui](https://ui.shadcn.com/) 组件库，提供：

- 现代化的设计系统
- 完全可定制的组件
- 无障碍访问支持
- TypeScript支持
- 暗色模式支持

### 主要组件

- **Button** - 按钮组件
- **Card** - 卡片容器
- **Table** - 数据表格
- **Dialog** - 模态对话框
- **Form** - 表单组件
- **Input** - 输入框
- **Select** - 选择器
- **Badge** - 徽章标签

## 📱 响应式设计

应用采用移动优先的响应式设计：

- **桌面端**: 完整的侧边栏导航
- **平板端**: 可折叠的侧边栏
- **移动端**: 底部导航栏

## 🔗 相关仓库

- **后端API**: [rasa_project_backend](https://github.com/WangShaoyu1/rasa_project_backend)
- **RASA Core**: [rasa_project_rasa](https://github.com/WangShaoyu1/rasa_project_rasa)

## 🚀 部署

### Docker部署

```bash
# 构建Docker镜像
docker build -t smart-home-frontend .

# 运行容器
docker run -p 3000:80 smart-home-frontend
```

### Nginx部署

```bash
# 构建生产版本
pnpm build

# 将dist目录部署到Nginx
cp -r dist/* /var/www/html/
```

### 云端部署

支持部署到各大云平台：

- **Vercel**: 连接GitHub自动部署
- **Netlify**: 拖拽dist目录部署
- **腾讯云**: 使用COS + CDN部署
- **阿里云**: 使用OSS + CDN部署

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.jsx` 添加路由配置
3. 在 `src/components/Layout.jsx` 添加导航菜单

### 添加新API

1. 在 `src/lib/api.js` 添加API方法
2. 在页面组件中调用API
3. 处理加载状态和错误

### 样式定制

使用Tailwind CSS进行样式定制：

```javascript
// 使用Tailwind类名
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold mb-4">标题</h2>
</div>
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 📧 邮箱：support@smart-home-voice.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/WangShaoyu1/rasa_project_frontend/issues)

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
