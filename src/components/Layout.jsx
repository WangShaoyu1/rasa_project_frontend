import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  Database, 
  Brain, 
  Cpu, 
  Smartphone, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';

const navigation = [
  {
    name: '概览',
    href: '/',
    icon: Home,
  },
  {
    name: '训练数据',
    href: '/training',
    icon: Database,
    children: [
      { name: '数据管理', href: '/training/data' },
      { name: '意图管理', href: '/training/intents' },
      { name: '实体管理', href: '/training/entities' },
      { name: '数据统计', href: '/training/statistics' },
    ]
  },
  {
    name: 'RASA模型',
    href: '/rasa',
    icon: Brain,
    children: [
      { name: '模型管理', href: '/rasa/models' },
      { name: '模型训练', href: '/rasa/train' },
      { name: '模型测试', href: '/rasa/test' },
      { name: '配置管理', href: '/rasa/config' },
    ]
  },
  {
    name: '大模型',
    href: '/llm',
    icon: Cpu,
    children: [
      { name: '配置管理', href: '/llm/configs' },
      { name: '模型测试', href: '/llm/test' },
      { name: '状态监控', href: '/llm/status' },
    ]
  },
  {
    name: '设备管理',
    href: '/devices',
    icon: Smartphone,
    children: [
      { name: '设备列表', href: '/devices/list' },
      { name: '设备控制', href: '/devices/control' },
      { name: '设备统计', href: '/devices/statistics' },
    ]
  },
  {
    name: '对话测试',
    href: '/chat',
    icon: MessageSquare,
    children: [
      { name: '对话界面', href: '/chat/interface' },
      { name: '对话历史', href: '/chat/history' },
      { name: '会话管理', href: '/chat/sessions' },
    ]
  },
  {
    name: '系统监控',
    href: '/monitor',
    icon: BarChart3,
    children: [
      { name: '系统状态', href: '/monitor/status' },
      { name: '性能监控', href: '/monitor/performance' },
      { name: '日志查看', href: '/monitor/logs' },
    ]
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const isChildActive = (parentHref, childHref) => {
    return location.pathname === childHref;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">智能家居</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
                
                {/* 子菜单 */}
                {item.children && isActive(item.href) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-md transition-colors",
                          isChildActive(item.href, child.href)
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                智能家居语音交互系统管理后台
              </span>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="flex-1">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

