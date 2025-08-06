import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain, 
  Cpu,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { chatAPI } from '@/lib/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        text: inputText,
        session_id: sessionId
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.data.response,
        intent: response.data.data.intent,
        confidence: response.data.data.confidence,
        entities: response.data.data.entities,
        model_used: response.data.data.model_used,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '抱歉，系统出现错误，请稍后再试',
        error: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getModelIcon = (modelUsed) => {
    if (modelUsed === 'rasa') return <Brain className="h-4 w-4" />;
    if (modelUsed?.startsWith('llm_')) return <Cpu className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* 头像 */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : message.error ? 'bg-red-500' : 'bg-gray-500'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>
          
          {/* 消息内容 */}
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : message.error 
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
          }`}>
            <p className="text-sm">{message.content}</p>
            
            {/* 机器人消息的额外信息 */}
            {!isUser && !message.error && (
              <div className="mt-2 space-y-1">
                {/* 意图和置信度 */}
                {message.intent && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {message.intent}
                    </Badge>
                    {message.confidence !== undefined && (
                      <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(message.confidence)}`}>
                        {(message.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
                
                {/* 实体信息 */}
                {message.entities && message.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {message.entities.map((entity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {entity.entity}: {entity.value}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* 模型信息 */}
                {message.model_used && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    {getModelIcon(message.model_used)}
                    <span>{message.model_used}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 时间戳 */}
            <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">对话测试</h1>
          <p className="text-muted-foreground">测试智能家居语音交互系统的对话能力</p>
        </div>
        <Button variant="outline" onClick={clearChat}>
          <RotateCcw className="mr-2 h-4 w-4" />
          清空对话
        </Button>
      </div>

      {/* 对话界面 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 主对话区域 */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>对话窗口</span>
              </CardTitle>
              <CardDescription>
                会话ID: {sessionId}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* 消息列表 */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>开始对话吧！试试说"你好"或"打开客厅灯"</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))
                  )}
                  
                  {loading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* 输入区域 */}
              <div className="flex items-center space-x-2 mt-4">
                <Input
                  placeholder="输入您的消息..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputText.trim() || loading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 快速测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速测试</CardTitle>
              <CardDescription>点击下方按钮快速测试常用指令</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                '你好',
                '打开客厅灯',
                '关闭空调',
                '调亮一点',
                '把温度调到26度',
                '打开窗帘',
                '再见'
              ].map((text) => (
                <Button
                  key={text}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setInputText(text)}
                  disabled={loading}
                >
                  {text}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 设备状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>设备状态</span>
              </CardTitle>
              <CardDescription>当前模拟设备状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">客厅灯</span>
                <Badge variant="secondary">关闭</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">卧室灯</span>
                <Badge variant="secondary">关闭</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">客厅空调</span>
                <Badge variant="secondary">关闭</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">客厅窗帘</span>
                <Badge variant="secondary">关闭</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 对话统计 */}
          <Card>
            <CardHeader>
              <CardTitle>本次会话统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">消息数量</span>
                <span className="text-sm font-medium">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">用户消息</span>
                <span className="text-sm font-medium">
                  {messages.filter(m => m.type === 'user').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">机器人回复</span>
                <span className="text-sm font-medium">
                  {messages.filter(m => m.type === 'bot').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">RASA处理</span>
                <span className="text-sm font-medium">
                  {messages.filter(m => m.model_used === 'rasa').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">大模型处理</span>
                <span className="text-sm font-medium">
                  {messages.filter(m => m.model_used?.startsWith('llm_')).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

