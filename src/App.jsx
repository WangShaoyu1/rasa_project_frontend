import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import TrainingData from '@/pages/training/TrainingData';
import ChatInterface from '@/pages/chat/ChatInterface';
import ModelManagement from '@/pages/rasa/ModelManagement';
import LLMConfig from '@/pages/llm/LLMConfig';
import DeviceManagement from '@/pages/devices/DeviceManagement';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="training/data" element={<TrainingData />} />
          <Route path="rasa/models" element={<ModelManagement />} />
          <Route path="llm/configs" element={<LLMConfig />} />
          <Route path="devices/list" element={<DeviceManagement />} />
          <Route path="chat/interface" element={<ChatInterface />} />
          {/* 其他路由将在后续添加 */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
